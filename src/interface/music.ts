export type PlayerStyle = 'bottom-bar' | 'floating-capsule' | 'tape-dock';

export type PlaybackMode = 'sequence' | 'repeat' | 'shuffle';

export interface LyricLine {
  time: number;
  text: string;
  translation?: string;
}

export type MusicApiErrorCode =
  | 'INVALID_REQUEST'
  | 'UPSTREAM_UNAVAILABLE'
  | 'TRACK_UNAVAILABLE'
  | 'STREAM_UNAVAILABLE';

export interface MusicApiErrorPayload {
  code: MusicApiErrorCode;
  message: string;
}

export type WaveformStatus = 'idle' | 'ready' | 'active' | 'fallback';

export interface RadioSysConfig {
  playerStyle?: PlayerStyle;
  showProgress?: boolean;
  autoPlay?: boolean;
  defaultVolume?: number;
  bgmList?: TrackDetail[];
  noiseList?: { name: string; src: string; icon?: string }[];
}

export type MusicSource = 'netease' | 'tencent' | 'kugou' | 'kuwo' | 'bilibili' | 'joox';

export interface ApiSearchResult {
  id: string;
  name: string;
  artist: string | string[];
  album: string;
  pic_id: string;
  url_id?: string;
  lyric_id: string;
  source: MusicSource;
}

export interface TrackDetail {
  id: string;
  title: string;
  artist: string;
  album: string;
  src: string;
  cover?: string;
  picId?: string;
  urlId?: string;
  lyricId?: string;
  lyric?: string;
  tlyric?: string;
  source: MusicSource;
}
