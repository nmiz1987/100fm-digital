export interface Slider {
  audio: string;
  info?: string;
}

export interface Station {
  name: string;
  audio: string;
  audioA?: string;
  info?: string;
  xml?: string;
  slug: string;
  logo: string;
  cover?: string;
  carIcon?: string;
  description?: string;
  popular?: string;
  content?: string;
  tag?: string;
  sliders?: Slider[];
}

export interface NowPlaying {
  artist: string;
  name: string;
  timestamp: number;
  before: number;
}

export interface PlayerState {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
}
