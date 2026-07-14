import { isIP } from 'node:net';
import { NextResponse } from 'next/server';
import type { MusicApiErrorCode, MusicSource } from '@/interface/music';

const MUSIC_API_URL = 'https://music-api.gdstudio.xyz/api.php';
const ALLOWED_SOURCES = new Set<MusicSource>(['netease', 'tencent', 'kugou', 'kuwo', 'bilibili', 'joox']);
const ALLOWED_TYPES = new Set(['search', 'url', 'pic', 'lyric', 'stream', 'playlist']);

function errorResponse(code: MusicApiErrorCode, message: string, status: number) {
  return NextResponse.json({ code, message }, { status });
}

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) return false;
  return parts[0] === 10 || parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168);
}

function isSafeStreamUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    if ((url.protocol !== 'https:' && url.protocol !== 'http:') || hostname === 'localhost' || hostname.endsWith('.local')) return false;
    if (isPrivateIpv4(hostname)) return false;
    if (isIP(hostname) === 6 && (hostname === '::1' || hostname.startsWith('fc') || hostname.startsWith('fd'))) return false;
    return true;
  } catch {
    return false;
  }
}

async function requestMusicApi(
  requestType: string,
  params: { source: MusicSource; name?: string; id?: string; br?: string; size?: string; count?: string; pages?: string },
) {
  const targetUrl = new URL(MUSIC_API_URL);
  targetUrl.searchParams.set('types', requestType);
  targetUrl.searchParams.set('source', params.source);
  if (params.name) targetUrl.searchParams.set('name', params.name);
  if (params.id) targetUrl.searchParams.set('id', params.id);
  if (params.br) targetUrl.searchParams.set('br', params.br);
  if (params.size) targetUrl.searchParams.set('size', params.size);
  if (params.count) targetUrl.searchParams.set('count', params.count);
  if (params.pages) targetUrl.searchParams.set('pages', params.pages);

  const response = await fetch(targetUrl, {
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36',
    },
    cache: requestType === 'url' ? 'no-store' : undefined,
    next: requestType === 'url' ? undefined : { revalidate: 60 },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) throw new Error(`第三方接口响应失败 (${response.status})`);
  const text = await response.text();
  if (!text.trim()) throw new Error('第三方接口返回无内容');

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('解析第三方接口响应失败');
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    if (obj.error && typeof obj.error === 'string' && obj.error.length > 0) throw new Error(obj.error);
    if (obj.message && typeof obj.code === 'number' && obj.code !== 200 && obj.code !== 0) {
      throw new Error(String(obj.message));
    }
  }

  return data;
}

/**
 * 智能多源音频 URL 降级解析
 * 1. 尝试当前源不同码率 (320k -> 192k -> 128k)
 * 2. 若缺少 name，根据 id 尝试查找歌名
 * 3. 跨源（netease -> kuwo -> joox -> bilibili）同名匹配多码率可播放音轨
 */
async function resolveAudioUrlWithFallback(source: MusicSource, id: string, name?: string, br = '320000'): Promise<string> {
  const bitrates = [br, '320000', '192000', '128000'].filter((v, i, a) => a.indexOf(v) === i);

  // 1. 尝试当前源的多码率
  for (const rate of bitrates) {
    try {
      const res = (await requestMusicApi('url', { source, id, br: rate })) as { url?: string };
      if (res?.url && isSafeStreamUrl(res.url)) return res.url;
    } catch {
      // continue
    }
  }

  // 2. 如果缺少 name，尝试通过 search 反查歌名
  let trackName = name?.trim();
  if (!trackName) {
    try {
      const searchRes = (await requestMusicApi('search', { source, name: id, count: '1' })) as Array<{ name?: string }>;
      if (Array.isArray(searchRes) && searchRes[0]?.name) {
        trackName = searchRes[0].name;
      }
    } catch {
      // ignore
    }
  }

  // 3. 跨源降级匹配同名音轨 (只使用 netease, kuwo, bilibili，绝不使用会偷换音轨的 joox)
  if (trackName) {
    const fallbackSources: MusicSource[] = (['netease', 'kuwo', 'bilibili'] as MusicSource[]).filter((s) => s !== source);
    for (const fbSource of fallbackSources) {
      try {
        const searchRes = (await requestMusicApi('search', { source: fbSource, name: trackName, count: '3' })) as Array<{ id: string; name?: string }>;
        if (Array.isArray(searchRes)) {
          for (const item of searchRes) {
            // 确保匹配到的歌曲名称包含要找的歌名关键字
            if (item.name && !item.name.toLowerCase().includes(trackName.toLowerCase()) && !trackName.toLowerCase().includes(item.name.toLowerCase())) {
              continue;
            }
            for (const rate of ['320000', '128000']) {
              try {
                const fbUrlRes = (await requestMusicApi('url', { source: fbSource, id: item.id, br: rate })) as { url?: string };
                if (fbUrlRes?.url && isSafeStreamUrl(fbUrlRes.url)) {
                  return fbUrlRes.url;
                }
              } catch {
                continue;
              }
            }
          }
        }
      } catch {
        continue;
      }
    }
  }

  return '';
}

import { toSimplifiedChinese } from '@/lib/chinese';

/**
 * 智能多源歌词降级解析
 * 当指定源（如 joox）无歌词时，自动尝试其他源（netease -> kuwo）检索同名曲目获取歌词
 */
async function resolveLyricWithFallback(source: MusicSource, id: string, name?: string): Promise<{ lyric: string; tlyric: string; from: string }> {
  try {
    const res = (await requestMusicApi('lyric', { source, id })) as { lyric?: string; tlyric?: string; from?: string };
    if (res?.lyric && res.lyric.trim().length > 0) {
      return {
        lyric: toSimplifiedChinese(res.lyric),
        tlyric: toSimplifiedChinese(res.tlyric || ''),
        from: res.from || 'music.gdstudio.xyz',
      };
    }
  } catch {
    // continue to fallback
  }

  if (name) {
    const fallbackSources: MusicSource[] = (['netease', 'kuwo', 'bilibili'] as MusicSource[]).filter((s) => s !== source);
    for (const fbSource of fallbackSources) {
      try {
        const searchRes = (await requestMusicApi('search', { source: fbSource, name, count: '1' })) as Array<{ lyric_id?: string; id: string }>;
        if (Array.isArray(searchRes) && searchRes.length > 0) {
          const fbLyricRes = (await requestMusicApi('lyric', { source: fbSource, id: searchRes[0].lyric_id || searchRes[0].id })) as { lyric?: string; tlyric?: string; from?: string };
          if (fbLyricRes?.lyric && fbLyricRes.lyric.trim().length > 0) {
            return {
              lyric: toSimplifiedChinese(fbLyricRes.lyric),
              tlyric: toSimplifiedChinese(fbLyricRes.tlyric || ''),
              from: fbLyricRes.from || 'music.gdstudio.xyz',
            };
          }
        }
      } catch {
        continue;
      }
    }
  }

  return { lyric: '', tlyric: '', from: 'music.gdstudio.xyz' };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestType = searchParams.get('types') || 'search';
  const source = (searchParams.get('source') || 'netease') as MusicSource;
  const name = searchParams.get('name')?.trim() || '';
  const id = searchParams.get('id')?.trim() || '';
  const br = searchParams.get('br') || '320000';
  const size = searchParams.get('size') || '300';
  const count = searchParams.get('count') || '12';
  const pages = searchParams.get('pages') || '1';

  if (!ALLOWED_TYPES.has(requestType)) return errorResponse('INVALID_REQUEST', '不支持的音乐请求类型', 400);
  if (!ALLOWED_SOURCES.has(source)) return errorResponse('INVALID_REQUEST', '不支持的音乐来源', 400);
  if (requestType === 'search' && !name) return errorResponse('INVALID_REQUEST', '搜索关键词不能为空', 400);
  if (requestType !== 'search' && !id) return errorResponse('INVALID_REQUEST', '曲目标识不能为空', 400);

  const params = { source, name, id, br, size, count, pages };

  try {
    if (requestType === 'search') {
      let data = await requestMusicApi('search', params);
      if (Array.isArray(data) && data.length === 0) {
        const fallbackSource: MusicSource = source === 'netease' ? 'kuwo' : 'netease';
        data = await requestMusicApi('search', { ...params, source: fallbackSource });
      }
      return NextResponse.json(Array.isArray(data) ? data : []);
    }

    if (requestType === 'lyric') {
      const lyricData = await resolveLyricWithFallback(source, id, name);
      return NextResponse.json(lyricData);
    }

    if (requestType === 'stream') {
      const audioUrl = await resolveAudioUrlWithFallback(source, id, name, br);
      if (!audioUrl) {
        return errorResponse('TRACK_UNAVAILABLE', '全网暂无可用的音频播放路径', 404);
      }
      return NextResponse.redirect(audioUrl, { status: 302 });
    }

    if (requestType === 'playlist') {
      if (source === 'tencent') {
        const dataPayload = {
          req_0: {
            module: 'music.srfDissInfo.aiDissInfo',
            method: 'uniform_get_Dissinfo',
            param: { disstid: Number(id) || id, enc_host_uin: '' },
          },
        };
        const qqUrl = `https://u.y.qq.com/cgi-bin/musicu.fcg?g_tk=5381&format=json&data=${encodeURIComponent(JSON.stringify(dataPayload))}`;
        const response = await fetch(qqUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Referer: 'https://y.qq.com/',
          },
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) throw new Error(`QQ音乐接口响应失败 (${response.status})`);
        const json = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const songlist = json?.req_0?.data?.songlist || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = songlist.map((song: any) => ({
          id: song.mid || String(song.id),
          name: song.name || song.title || '未知曲目',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          artist: Array.isArray(song.singer) ? song.singer.map((s: any) => s.name) : (song.singer?.name || '未知歌手'),
          album: song.album?.name || 'QQ音乐歌单',
          pic_id: song.album?.mid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.album.mid}.jpg` : (song.mid || String(song.id)),
          url_id: song.name,
          lyric_id: song.mid || String(song.id),
          source: 'tencent',
        }));
        return NextResponse.json(items);
      }

      if (source === 'kugou') {
        const kgUrl = `https://mobilecdnbj.kugou.com/api/v3/special/song?specialid=${encodeURIComponent(id)}&page=1&pagesize=100`;
        const response = await fetch(kgUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) throw new Error(`酷狗音乐接口响应失败 (${response.status})`);
        const json = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const songlist = json?.data?.info || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = songlist.map((item: any) => {
          const parts = (item.filename || '').split(' - ');
          const artist = parts.length > 1 ? parts[0].trim() : '未知歌手';
          const name = parts.length > 1 ? parts.slice(1).join(' - ').trim() : (item.filename || '未知曲目');
          return {
            id: item.hash || String(item.audio_id),
            name,
            artist,
            album: '酷狗歌单',
            pic_id: item.hash,
            url_id: name,
            lyric_id: item.hash,
            source: 'kugou',
          };
        });
        return NextResponse.json(items);
      }

      if (source === 'netease') {
        try {
          const neteaseUrl = `https://music.163.com/api/v1/playlist/detail?id=${encodeURIComponent(id)}`;
          const response = await fetch(neteaseUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              Referer: 'https://music.163.com/',
            },
            signal: AbortSignal.timeout(10_000),
          });
          if (response.ok) {
            const json = await response.json();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const playlistData = json?.playlist || json?.result;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const trackIds = (playlistData?.trackIds || []).map((t: any) => t.id).filter(Boolean);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let rawTracks: any[] = [];

            if (trackIds.length > 0) {
              const chunkSize = 500;
              for (let i = 0; i < Math.min(trackIds.length, 1000); i += chunkSize) {
                const chunkIds = trackIds.slice(i, i + chunkSize);
                const cParam = JSON.stringify(chunkIds.map((tid: number | string) => ({ id: tid })));
                const detailUrl = `https://music.163.com/api/v3/song/detail?c=${encodeURIComponent(cParam)}`;
                const detailRes = await fetch(detailUrl, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    Referer: 'https://music.163.com/',
                  },
                  signal: AbortSignal.timeout(10_000),
                });
                if (detailRes.ok) {
                  const detailJson = await detailRes.json();
                  if (Array.isArray(detailJson?.songs)) {
                    rawTracks.push(...detailJson.songs);
                  }
                }
              }
            }

            if (rawTracks.length === 0) {
              rawTracks = playlistData?.tracks || [];
            }

            if (Array.isArray(rawTracks) && rawTracks.length > 0) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const items = rawTracks.map((track: any) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const artistList = track.ar || track.artists || [];
                const artist = Array.isArray(artistList)
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ? artistList.map((a: any) => a.name).join(' / ')
                  : (artistList.name || '未知歌手');
                const album = track.al?.name || track.album?.name || '网易云歌单';
                const picId = track.al?.picUrl || track.album?.picUrl || track.al?.pic_str || track.al?.pic || track.album?.picId || String(track.id);

                return {
                  id: String(track.id),
                  name: track.name || '未知曲目',
                  artist,
                  album,
                  pic_id: String(picId),
                  url_id: String(track.id),
                  lyric_id: String(track.id),
                  source: 'netease',
                };
              });
              return NextResponse.json(items);
            }
          }
        } catch {
          // fallback to requestMusicApi
        }
      }

      const data = await requestMusicApi('playlist', params);
      return NextResponse.json(Array.isArray(data) ? data : []);
    }

    const data = await requestMusicApi(requestType, params);
    if (requestType === 'url' && !(data as { url?: string })?.url) {
      const audioUrl = await resolveAudioUrlWithFallback(source, id, name, br);
      if (audioUrl) {
        return NextResponse.json({ url: audioUrl });
      }
      return errorResponse('TRACK_UNAVAILABLE', '全网暂无可用的音频播放路径', 404);
    }
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error
      ? (error.name === 'TimeoutError' ? '音乐服务响应超时' : error.message)
      : '音乐服务暂时不可用';
    return errorResponse('UPSTREAM_UNAVAILABLE', message, 502);
  }
}
