import axios, { AxiosError } from 'axios';
import {
  ApiSearchResult,
  MusicApiErrorPayload,
  MusicSource,
  TrackDetail,
} from '@/interface/music';

const MUSIC_API_URL = '/api/music';

export class MusicApiError extends Error {
  code: MusicApiErrorPayload['code'];
  status?: number;

  constructor(message: string, code: MusicApiErrorPayload['code'] = 'UPSTREAM_UNAVAILABLE', status?: number) {
    super(message);
    this.name = 'MusicApiError';
    this.code = code;
    this.status = status;
  }
}

function normalizeMusicError(error: unknown) {
  if (error instanceof MusicApiError) return error;
  if (error instanceof AxiosError) {
    const payload = error.response?.data as Partial<MusicApiErrorPayload> | undefined;
    return new MusicApiError(
      payload?.message || '音乐服务暂时不可用',
      payload?.code || 'UPSTREAM_UNAVAILABLE',
      error.response?.status,
    );
  }
  return new MusicApiError(error instanceof Error ? error.message : '音乐服务暂时不可用');
}

export function buildMusicStreamUrl(id: string, source: MusicSource = 'netease', name?: string, br = 320000) {
  const params = new URLSearchParams({ types: 'stream', source, id, br: String(br) });
  if (name) params.set('name', name);
  return `${MUSIC_API_URL}?${params.toString()}`;
}

import { toSimplifiedChinese } from '@/lib/chinese';

/**
 * 搜索音乐列表
 * @param name 搜索关键词（歌曲/歌手/专辑）
 * @param source 音乐源 (默认 netease)
 * @param count 返回数量
 */
export async function searchMusic(
  name: string,
  source: MusicSource = 'netease',
  count = 12
): Promise<ApiSearchResult[]> {
  if (!name.trim()) return [];
  try {
    const res = await axios.get<ApiSearchResult[]>(MUSIC_API_URL, {
      params: {
        types: 'search',
        source,
        name: name.trim(),
        count,
        pages: 1,
      },
      timeout: 8000,
    });
    const items = Array.isArray(res.data) ? res.data : [];
    return items.map((item) => ({
      ...item,
      name: toSimplifiedChinese(item.name || ''),
      artist: Array.isArray(item.artist)
        ? item.artist.map((a) => toSimplifiedChinese(a))
        : toSimplifiedChinese(item.artist || ''),
      album: toSimplifiedChinese(item.album || ''),
    }));
  } catch (error) {
    throw normalizeMusicError(error);
  }
}

/**
 * 获取音频真实播放 URL (320k 优先)
 */
export async function fetchMusicUrl(
  id: string,
  source: MusicSource = 'netease',
  br = 320000
): Promise<string> {
  try {
    const res = await axios.get(MUSIC_API_URL, {
      params: {
        types: 'url',
        source,
        id,
        br,
      },
      timeout: 8000,
    });
    return res.data?.url || '';
  } catch (error) {
    throw normalizeMusicError(error);
  }
}

/**
 * 获取专辑封面 URL
 */
export async function fetchMusicPic(
  picId: string,
  source: MusicSource = 'netease',
  size = 300
): Promise<string> {
  if (!picId) return '';
  if (picId.startsWith('http://') || picId.startsWith('https://')) {
    return picId;
  }
  try {
    const res = await axios.get(MUSIC_API_URL, {
      params: {
        types: 'pic',
        source,
        id: picId,
        size,
      },
      timeout: 6000,
    });
    return res.data?.url || '';
  } catch (error) {
    throw normalizeMusicError(error);
  }
}

/**
 * 获取 LRC 歌词
 */
export async function fetchMusicLyric(
  lyricId: string,
  source: MusicSource = 'netease',
  name?: string
): Promise<{ lyric: string; tlyric: string }> {
  if (!lyricId && !name) return { lyric: '', tlyric: '' };
  try {
    const res = await axios.get(MUSIC_API_URL, {
      params: {
        types: 'lyric',
        source,
        id: lyricId || name,
        ...(name ? { name } : {}),
      },
      timeout: 6000,
    });
    return {
      lyric: toSimplifiedChinese(res.data?.lyric || ''),
      tlyric: toSimplifiedChinese(res.data?.tlyric || ''),
    };
  } catch (error) {
    throw normalizeMusicError(error);
  }
}

/**
 * 懒加载解析：当用户点击播放搜索出来的曲目时，按需请求音频 URL 和 封面
 */
export async function resolveTrackDetails(searchResult: ApiSearchResult): Promise<TrackDetail> {
  const rawArtist = Array.isArray(searchResult.artist)
    ? searchResult.artist.join(' / ')
    : searchResult.artist || '未知歌手';
  const formattedArtist = toSimplifiedChinese(rawArtist);

  const [coverResult, lyricResult] = await Promise.allSettled([
    fetchMusicPic(searchResult.pic_id, searchResult.source),
    fetchMusicLyric(searchResult.lyric_id || searchResult.id, searchResult.source, searchResult.name),
  ]);

  let cover = coverResult.status === 'fulfilled' ? coverResult.value : '';
  if (!cover && (searchResult.pic_id?.startsWith('http://') || searchResult.pic_id?.startsWith('https://'))) {
    cover = searchResult.pic_id;
  }

  const lyrics = lyricResult.status === 'fulfilled'
    ? lyricResult.value
    : { lyric: '', tlyric: '' };

  return {
    id: searchResult.id,
    title: toSimplifiedChinese(searchResult.name),
    artist: formattedArtist,
    album: toSimplifiedChinese(searchResult.album || '单曲'),
    src: buildMusicStreamUrl(searchResult.url_id || searchResult.id, searchResult.source, searchResult.name),
    cover,
    picId: searchResult.pic_id,
    urlId: searchResult.url_id || searchResult.id,
    lyricId: searchResult.lyric_id || searchResult.id,
    lyric: lyrics.lyric,
    tlyric: lyrics.tlyric,
    source: searchResult.source,
  };
}

export interface ParsedPlaylist {
  source: MusicSource;
  id: string;
}

/**
 * 智能解析网易云音乐歌单分享链接或纯数字ID
 */
export function parsePlaylistUrl(input: string, defaultSource: MusicSource = 'netease'): ParsedPlaylist | null {
  const text = input.trim();
  if (!text) return null;

  // 网易云音乐 (netease)
  if (text.includes('163.com') || text.includes('163cn.tv')) {
    const idMatch = text.match(/[?&]id=(\d+)/);
    if (idMatch) return { source: 'netease', id: idMatch[1] };
  }

  // 纯数字/字母 ID，默认设为 netease
  if (/^[a-zA-Z0-9_]+$/.test(text)) {
    return { source: defaultSource, id: text };
  }

  return null;
}

/**
 * 歌单导入：1 次请求拉取全歌单元数据，每首曲目的播放流与资源采用懒加载机制
 */
export async function fetchPlaylist(
  id: string,
  source: MusicSource = 'netease'
): Promise<TrackDetail[]> {
  try {
    const res = await axios.get<ApiSearchResult[]>(MUSIC_API_URL, {
      params: {
        types: 'playlist',
        source,
        id,
      },
      timeout: 12000,
    });

    const items = Array.isArray(res.data) ? res.data : [];
    if (items.length === 0) {
      throw new MusicApiError('未在歌单中找到有效曲目，请检查歌单ID或公开权限', 'TRACK_UNAVAILABLE');
    }

    return items.map((item) => {
      const rawArtist = Array.isArray(item.artist)
        ? item.artist.join(' / ')
        : item.artist || '未知歌手';
      const formattedArtist = toSimplifiedChinese(rawArtist);

      return {
        id: item.id,
        title: toSimplifiedChinese(item.name || '未知曲目'),
        artist: formattedArtist,
        album: toSimplifiedChinese(item.album || '歌单导入'),
        src: buildMusicStreamUrl(item.url_id || item.id, item.source || source, item.name),
        cover: '',
        picId: item.pic_id,
        urlId: item.url_id || item.id,
        lyricId: item.lyric_id || item.id,
        lyric: '',
        tlyric: '',
        source: item.source || source,
      };
    });
  } catch (error) {
    throw normalizeMusicError(error);
  }
}
