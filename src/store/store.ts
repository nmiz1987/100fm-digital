import { create, StateCreator } from 'zustand';
import { PersistOptions } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import Hls from 'hls.js';
import type { Station, Slider, NowPlaying } from '../types';
import { filterStations, type Tab } from '../utils/filterStations';
import { fetchNowPlayingJson } from '../utils/proxyUrl';

const NOW_PLAYING_POLL_INTERVAL = 30_000;
const LOADING_WARNING_DELAY = 10_000;
const LOADING_WARNING_DURATION = 3_000;

interface StoreState {
  // Theme
  isDarkMode: boolean;
  handleDarkModeToggle: () => void;

  // Search / tab filters
  search: string;
  setSearch: (value: string) => void;
  tab: Tab;
  setTab: (tab: Tab) => void;

  // Station grid view mode
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;

  // Favorites / hidden stations
  favorites: string[];
  toggleFavorite: (slug: string) => void;
  hidden: string[];
  toggleHidden: (slug: string) => void;

  // Stations
  stations: Station[];
  stationsLoading: boolean;
  stationsError: string | null;
  fetchStations: () => Promise<void>;

  // Player
  currentStation: Station | null;
  currentSlider: Slider | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  nowPlaying: NowPlaying | null;
  sliderLabels: string[];
  loadingTimeoutVisible: boolean;
  dismissLoadingTimeout: () => void;

  play: (station: Station) => void;
  playSlider: (slider: Slider) => void;
  playLive: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  handlePlay: (station: Station) => void;
  handlePlayPause: () => void;
  handleSelectSlider: (slider: Slider) => void;
  handleSelectLive: () => void;
}

// Audio engine state lives outside the store: HTMLAudioElement/Hls instances
// and timers are not serializable and don't need to be reactive themselves.
let audioEl: HTMLAudioElement | null = null;
let hls: Hls | null = null;
let nowPlayingIntervalId: ReturnType<typeof setInterval> | null = null;
let sliderLabelsIntervalId: ReturnType<typeof setInterval> | null = null;
let loadingShowTimeoutId: ReturnType<typeof setTimeout> | null = null;
let loadingHideTimeoutId: ReturnType<typeof setTimeout> | null = null;

type SetFn = (partial: Partial<StoreState> | ((state: StoreState) => Partial<StoreState>)) => void;
type GetFn = () => StoreState;

function buildSliderLabel(data: { artist?: string; name?: string } | null, fallback: string): string {
  const artist = data?.artist?.trim();
  const name = data?.name?.trim();
  if (artist && name) return `${artist} — ${name}`;
  if (artist) return artist;
  if (name) return name;
  return fallback;
}

function clearLoadingTimeout() {
  if (loadingShowTimeoutId) {
    clearTimeout(loadingShowTimeoutId);
    loadingShowTimeoutId = null;
  }
  if (loadingHideTimeoutId) {
    clearTimeout(loadingHideTimeoutId);
    loadingHideTimeoutId = null;
  }
}

function scheduleLoadingTimeout(set: SetFn) {
  clearLoadingTimeout();
  loadingShowTimeoutId = setTimeout(() => {
    set({ loadingTimeoutVisible: true });
    loadingHideTimeoutId = setTimeout(() => set({ loadingTimeoutVisible: false }), LOADING_WARNING_DURATION);
  }, LOADING_WARNING_DELAY);
}

function stopNowPlayingPolling() {
  if (nowPlayingIntervalId) {
    clearInterval(nowPlayingIntervalId);
    nowPlayingIntervalId = null;
  }
}

function startNowPlayingPolling(set: SetFn, infoUrl: string | undefined) {
  stopNowPlayingPolling();
  set({ nowPlaying: null });
  if (!infoUrl) return;

  const fetchOnce = async () => {
    const data = await fetchNowPlayingJson(infoUrl);
    if (data) set({ nowPlaying: data as NowPlaying });
  };

  void fetchOnce();
  nowPlayingIntervalId = setInterval(() => void fetchOnce(), NOW_PLAYING_POLL_INTERVAL);
}

function stopSliderLabelsPolling() {
  if (sliderLabelsIntervalId) {
    clearInterval(sliderLabelsIntervalId);
    sliderLabelsIntervalId = null;
  }
}

function startSliderLabelsPolling(set: SetFn, station: Station) {
  stopSliderLabelsPolling();
  const sliders = station.sliders;
  if (!sliders || sliders.length === 0) {
    set({ sliderLabels: [] });
    return;
  }

  const refresh = async () => {
    const liveLabel = station.info
      ? fetchNowPlayingJson(station.info).then((data) => buildSliderLabel(data, `${station.name} #1`))
      : Promise.resolve(`${station.name} #1`);

    const sliderResults = sliders.map((slider, i) =>
      slider.info
        ? fetchNowPlayingJson(slider.info).then((data) => buildSliderLabel(data, `${station.name} #${i + 2}`))
        : Promise.resolve(`${station.name} #${i + 2}`),
    );

    const results = await Promise.all([liveLabel, ...sliderResults]);
    set({ sliderLabels: results });
  };

  void refresh();
  sliderLabelsIntervalId = setInterval(() => void refresh(), NOW_PLAYING_POLL_INTERVAL);
}

function destroyHls() {
  if (hls) {
    hls.destroy();
    hls = null;
  }
}

function getAudio(set: SetFn, get: GetFn): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.volume = get().volume;
    audioEl.addEventListener('playing', () => {
      clearLoadingTimeout();
      set({ isPlaying: true, isLoading: false, loadingTimeoutVisible: false });
    });
    audioEl.addEventListener('pause', () => set({ isPlaying: false }));
    audioEl.addEventListener('waiting', () => {
      set({ isLoading: true });
      scheduleLoadingTimeout(set);
    });
  }
  return audioEl;
}

function loadAudio(set: SetFn, get: GetFn, src: string, fallbackSrc?: string) {
  const audio = getAudio(set, get);
  destroyHls();
  audio.pause();
  set({ isLoading: true });
  scheduleLoadingTimeout(set);

  if (Hls.isSupported() && src.includes('.m3u8')) {
    hls = new Hls({ enableWorker: true });
    hls.loadSource(src);
    hls.attachMedia(audio);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      void audio.play();
    });
    hls.on(Hls.Events.ERROR, (_evt, data) => {
      if (data.fatal && fallbackSrc) {
        destroyHls();
        audio.src = fallbackSrc;
        void audio.play();
      }
    });
  } else if (audio.canPlayType('application/vnd.apple.mpegurl') && src.includes('.m3u8')) {
    audio.src = src;
    void audio.play();
  } else {
    audio.src = fallbackSrc ?? src;
    void audio.play();
  }
}

// One-time migration: seed persisted fields from the old per-key localStorage
// entries written by the previous useLocalStorage-based implementation.
function readLegacyJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readLegacyViewMode(): 'grid' | 'list' {
  if (typeof window === 'undefined') return 'grid';
  return window.localStorage.getItem('viewMode') === 'list' ? 'list' : 'grid';
}

const persistConfig: PersistOptions<StoreState, Partial<StoreState>> = {
  name: '100fm-digital-storage',
  storage: createJSONStorage(() => window.localStorage),
  partialize: (state) => ({
    isDarkMode: state.isDarkMode,
    favorites: state.favorites,
    hidden: state.hidden,
    volume: state.volume,
    viewMode: state.viewMode,
  }),
};

const store: StateCreator<StoreState> = (set, get) => ({
  isDarkMode: readLegacyJson('100fm_dark_mode', false),
  handleDarkModeToggle: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  search: '',
  setSearch: (value) => set({ search: value }),
  tab: 'all',
  setTab: (tab) => set({ tab }),

  viewMode: readLegacyViewMode(),
  setViewMode: (mode) => set({ viewMode: mode }),

  favorites: readLegacyJson<string[]>('100fm_favorites', []),
  toggleFavorite: (slug) =>
    set((state) => ({
      favorites: state.favorites.includes(slug) ? state.favorites.filter((s) => s !== slug) : [...state.favorites, slug],
    })),

  hidden: readLegacyJson<string[]>('100fm_hidden', []),
  toggleHidden: (slug) => {
    set((state) => ({
      hidden: state.hidden.includes(slug) ? state.hidden.filter((s) => s !== slug) : [...state.hidden, slug],
    }));
    if (get().currentStation?.slug === slug) get().stop();
  },

  stations: [],
  stationsLoading: true,
  stationsError: null,
  fetchStations: async () => {
    if (get().stations.length > 0 || !get().stationsLoading) return;

    try {
      const res = await fetch('https://digital.100fm.co.il/app/');
      const data = (await res.json()) as { stations?: Station[] };
      const list = Array.isArray(data.stations) ? data.stations : [];
      set({ stations: list.filter((s) => s.slug && s.audio), stationsLoading: false });
    } catch (err) {
      console.error('Error fetching stations:', err);
      set({ stationsError: 'לא ניתן לטעון את רשימת התחנות', stationsLoading: false });
    }
  },

  currentStation: null,
  currentSlider: null,
  isPlaying: false,
  isLoading: false,
  volume: readLegacyJson('100fm_volume', 0.8),
  nowPlaying: null,
  sliderLabels: [],
  loadingTimeoutVisible: false,
  dismissLoadingTimeout: () => {
    if (loadingHideTimeoutId) {
      clearTimeout(loadingHideTimeoutId);
      loadingHideTimeoutId = null;
    }
    set({ loadingTimeoutVisible: false });
  },

  play: (station) => {
    set({ currentStation: station, currentSlider: null });
    loadAudio(set, get, station.audio, station.audioA);
    startNowPlayingPolling(set, station.info);
    startSliderLabelsPolling(set, station);
  },

  playSlider: (slider) => {
    const station = get().currentStation;
    if (!station) return;
    set({ currentSlider: slider });
    loadAudio(set, get, slider.audio);
    startNowPlayingPolling(set, slider.info);
  },

  playLive: () => {
    const station = get().currentStation;
    if (!station) return;
    set({ currentSlider: null });
    loadAudio(set, get, station.audio, station.audioA);
    startNowPlayingPolling(set, station.info);
  },

  pause: () => audioEl?.pause(),

  resume: () => void audioEl?.play(),

  stop: () => {
    destroyHls();
    if (audioEl) {
      audioEl.pause();
      audioEl.src = '';
    }
    stopNowPlayingPolling();
    stopSliderLabelsPolling();
    clearLoadingTimeout();
    set({
      currentStation: null,
      currentSlider: null,
      isPlaying: false,
      isLoading: false,
      nowPlaying: null,
      sliderLabels: [],
      loadingTimeoutVisible: false,
    });
  },

  setVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    if (audioEl) audioEl.volume = clamped;
    set({ volume: clamped });
  },

  handlePlay: (station) => {
    const { currentStation, currentSlider, isPlaying, play, pause, resume } = get();
    if (currentStation?.slug === station.slug && !currentSlider) {
      if (isPlaying) pause();
      else resume();
    } else {
      play(station);
    }
  },

  handlePlayPause: () => {
    const { isPlaying, pause, resume } = get();
    if (isPlaying) pause();
    else resume();
  },

  handleSelectSlider: (slider) => {
    if (get().currentStation) get().playSlider(slider);
  },

  handleSelectLive: () => {
    if (get().currentStation) get().playLive();
  },
});

export const useStore = create(persist<StoreState, [], [], Partial<StoreState>>(store, persistConfig));

export function getFilteredStations(state: StoreState): Station[] {
  return filterStations(state.stations, {
    tab: state.tab,
    search: state.search,
    favorites: state.favorites,
    hidden: state.hidden,
  });
}

if (typeof document !== 'undefined') {
  useStore.subscribe((state) => {
    document.documentElement.classList.toggle('dark', state.isDarkMode);
  });
  document.documentElement.classList.toggle('dark', useStore.getState().isDarkMode);
}

if (typeof window !== 'undefined') {
  void useStore.getState().fetchStations();
}
