import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import type { Station, Slider } from '../../types';

// ---- HLS mock (hoisted so vi.mock factory can reference it) ----
type HlsEventHandler = (event: string, data?: unknown) => void;

const { mockHlsInstance, MockHls, mockFetch, audioRegistry } = vi.hoisted(() => {
  const mockHlsInstance = {
    loadSource: vi.fn(),
    attachMedia: vi.fn(),
    on: vi.fn() as ReturnType<typeof vi.fn>,
    destroy: vi.fn(),
  };
  // Must use a regular function (not arrow) so `new Hls()` works as a constructor.
  function MockHls() {
    return mockHlsInstance;
  }
  MockHls.isSupported = vi.fn().mockReturnValue(false);
  MockHls.Events = { MANIFEST_PARSED: 'hlsManifestParsed', ERROR: 'hlsError' };

  // ---- Audio mock ----
  // Module-level singleton in the store, so only one instance is ever created.
  const audioRegistry: { current: MockAudio | null } = { current: null };

  class MockAudio {
    src = '';
    volume = 0;
    play = vi.fn().mockResolvedValue(undefined);
    pause = vi.fn();
    canPlayType = vi.fn().mockReturnValue('');
    _listeners: Record<string, Array<() => void>> = {};

    constructor() {
      audioRegistry.current = this;
    }

    addEventListener(event: string, handler: () => void) {
      this._listeners[event] ??= [];
      this._listeners[event].push(handler);
    }

    removeEventListener(event: string, handler: () => void) {
      this._listeners[event] = (this._listeners[event] ?? []).filter((h) => h !== handler);
    }

    emit(event: string) {
      this._listeners[event]?.forEach((h) => h());
    }
  }

  // fetchStations() runs once at module-init time, so global.fetch must be
  // mocked before `../store` is imported.
  const mockFetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve({ stations: [] }) });
  global.fetch = mockFetch as unknown as typeof fetch;
  global.Audio = MockAudio as unknown as typeof Audio;

  return {
    mockHlsInstance,
    MockHls: MockHls as unknown as ReturnType<typeof vi.fn> & {
      isSupported: ReturnType<typeof vi.fn>;
      Events: { MANIFEST_PARSED: string; ERROR: string };
    },
    mockFetch,
    audioRegistry,
  };
});

vi.mock('hls.js', () => ({ default: MockHls }));
vi.mock('../../utils/proxyUrl', () => ({ fetchNowPlayingJson: vi.fn() }));

import { useStore, getFilteredStations } from '../store';
import { fetchNowPlayingJson } from '../../utils/proxyUrl';

const makeStation = (slug: string, name: string, overrides: Partial<Station> = {}): Station => ({
  name,
  audio: `http://stream/${slug}`,
  slug,
  logo: `${slug}.png`,
  ...overrides,
});

const station: Station = { name: 'Rock FM', audio: 'http://stream.mp3', slug: 'rock-fm', logo: 'logo.png' };
const stationWithFallback: Station = { ...station, audioA: 'http://fallback.mp3' };
const stationHls: Station = { ...station, audio: 'http://stream.m3u8', audioA: 'http://fallback.mp3' };
const slider: Slider = { audio: 'http://slider.mp3' };

const initialPlayerState = {
  currentStation: null,
  currentSlider: null,
  isPlaying: false,
  isLoading: false,
  nowPlaying: null,
  sliderLabels: [] as string[],
  loadingTimeoutVisible: false,
  volume: 0.8,
};

beforeEach(() => {
  vi.clearAllMocks();
  MockHls.isSupported.mockReturnValue(false);
  mockHlsInstance.on.mockReset();
  vi.mocked(fetchNowPlayingJson).mockReset();
  useStore.setState({
    isDarkMode: false,
    search: '',
    tab: 'all',
    viewMode: 'grid',
    favorites: [],
    hidden: [],
    stations: [],
    stationsLoading: false,
    stationsError: null,
    ...initialPlayerState,
  });
});

describe('theme', () => {
  it('handleDarkModeToggle flips isDarkMode', () => {
    expect(useStore.getState().isDarkMode).toBe(false);
    useStore.getState().handleDarkModeToggle();
    expect(useStore.getState().isDarkMode).toBe(true);
    useStore.getState().handleDarkModeToggle();
    expect(useStore.getState().isDarkMode).toBe(false);
  });
});

describe('filters', () => {
  it('setSearch updates search', () => {
    useStore.getState().setSearch('jazz');
    expect(useStore.getState().search).toBe('jazz');
  });

  it('setTab updates tab', () => {
    useStore.getState().setTab('favorites');
    expect(useStore.getState().tab).toBe('favorites');
  });

  it('setViewMode updates viewMode', () => {
    useStore.getState().setViewMode('list');
    expect(useStore.getState().viewMode).toBe('list');
  });
});

describe('favorites and hidden', () => {
  it('toggleFavorite adds and removes a slug', () => {
    useStore.getState().toggleFavorite('rock-fm');
    expect(useStore.getState().favorites).toEqual(['rock-fm']);
    useStore.getState().toggleFavorite('rock-fm');
    expect(useStore.getState().favorites).toEqual([]);
  });

  it('toggleHidden adds and removes a slug', () => {
    useStore.getState().toggleHidden('rock-fm');
    expect(useStore.getState().hidden).toEqual(['rock-fm']);
    useStore.getState().toggleHidden('rock-fm');
    expect(useStore.getState().hidden).toEqual([]);
  });

  it('toggleHidden stops playback when hiding the currently playing station', () => {
    useStore.getState().play(station);
    expect(useStore.getState().currentStation).toEqual(station);

    useStore.getState().toggleHidden(station.slug);

    expect(useStore.getState().hidden).toContain(station.slug);
    expect(useStore.getState().currentStation).toBeNull();
    expect(audioRegistry.current?.pause).toHaveBeenCalled();
  });

  it('toggleHidden does not affect playback for a different station', () => {
    useStore.getState().play(station);
    useStore.getState().toggleHidden('some-other-station');
    expect(useStore.getState().currentStation).toEqual(station);
    useStore.getState().stop();
  });
});

describe('getFilteredStations', () => {
  it('wraps filterStations using store state', () => {
    const stations = [makeStation('one', 'One', { popular: 'true' }), makeStation('two', 'Two'), makeStation('three', 'Three')];
    useStore.setState({ stations, tab: 'favorites', favorites: ['two'], search: '', hidden: [] });
    expect(getFilteredStations(useStore.getState()).map((s) => s.slug)).toEqual(['two']);
  });

  it('applies search on top of the tab filter', () => {
    const stations = [makeStation('rock-fm', 'Rock FM'), makeStation('jazz-club', 'Jazz Club')];
    useStore.setState({ stations, tab: 'all', favorites: [], hidden: [], search: 'rock' });
    expect(getFilteredStations(useStore.getState()).map((s) => s.slug)).toEqual(['rock-fm']);
  });
});

describe('fetchStations', () => {
  it('loads and filters stations that have both slug and audio', async () => {
    const mockStations = [
      { name: 'Radio 1', audio: 'http://stream1', slug: 'radio-1', logo: 'logo1.png' },
      { name: 'Radio 2', audio: 'http://stream2', slug: 'radio-2', logo: 'logo2.png' },
      { name: 'No Audio', slug: 'no-audio', logo: 'logo3.png' },
      { name: 'No Slug', audio: 'http://stream4', logo: 'logo4.png' },
    ];
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ stations: mockStations }) });
    useStore.setState({ stations: [], stationsLoading: true, stationsError: null });

    await useStore.getState().fetchStations();

    expect(useStore.getState().stations).toHaveLength(2);
    expect(useStore.getState().stations.map((s) => s.slug)).toEqual(['radio-1', 'radio-2']);
    expect(useStore.getState().stationsLoading).toBe(false);
    expect(useStore.getState().stationsError).toBeNull();
  });

  it('sets error state on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));
    useStore.setState({ stations: [], stationsLoading: true, stationsError: null });

    await useStore.getState().fetchStations();

    expect(useStore.getState().stationsError).toBe('לא ניתן לטעון את רשימת התחנות');
    expect(useStore.getState().stationsLoading).toBe(false);
    expect(useStore.getState().stations).toEqual([]);
  });

  it('does nothing if stations are already loaded', async () => {
    useStore.setState({ stations: [makeStation('a', 'A')], stationsLoading: false });

    await useStore.getState().fetchStations();

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does nothing if a fetch is not in a loading state', async () => {
    useStore.setState({ stations: [], stationsLoading: false });

    await useStore.getState().fetchStations();

    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('player engine', () => {
  afterEach(() => {
    useStore.getState().stop();
  });

  it('play() sets current station and triggers load', () => {
    useStore.getState().play(station);
    const state = useStore.getState();
    expect(state.currentStation).toEqual(station);
    expect(state.currentSlider).toBeNull();
    expect(state.isLoading).toBe(true);
    expect(audioRegistry.current?.play).toHaveBeenCalled();
  });

  it('play() loads via HLS when supported and src is .m3u8', () => {
    MockHls.isSupported.mockReturnValue(true);
    useStore.getState().play(stationHls);
    expect(mockHlsInstance.loadSource).toHaveBeenCalledWith(stationHls.audio);
    expect(mockHlsInstance.attachMedia).toHaveBeenCalled();
  });

  it('HLS MANIFEST_PARSED handler calls audio.play()', () => {
    MockHls.isSupported.mockReturnValue(true);
    let manifestHandler: (() => void) | undefined;
    mockHlsInstance.on.mockImplementation((event: string, handler: HlsEventHandler) => {
      if (event === MockHls.Events.MANIFEST_PARSED) manifestHandler = handler as () => void;
    });

    useStore.getState().play(stationHls);
    manifestHandler?.();
    expect(audioRegistry.current?.play).toHaveBeenCalled();
  });

  it('HLS ERROR handler falls back to fallbackSrc on fatal error', () => {
    MockHls.isSupported.mockReturnValue(true);
    let errorHandler: ((event: string, data: { fatal: boolean }) => void) | undefined;
    mockHlsInstance.on.mockImplementation((event: string, handler: HlsEventHandler) => {
      if (event === MockHls.Events.ERROR) errorHandler = handler as (event: string, data: { fatal: boolean }) => void;
    });

    useStore.getState().play(stationHls);
    errorHandler?.('hlsError', { fatal: true });

    expect(audioRegistry.current?.src).toBe(stationHls.audioA);
    expect(audioRegistry.current?.play).toHaveBeenCalled();
  });

  it('HLS ERROR with non-fatal error does nothing', () => {
    MockHls.isSupported.mockReturnValue(true);
    let errorHandler: ((event: string, data: { fatal: boolean }) => void) | undefined;
    mockHlsInstance.on.mockImplementation((event: string, handler: HlsEventHandler) => {
      if (event === MockHls.Events.ERROR) errorHandler = handler as (event: string, data: { fatal: boolean }) => void;
    });

    useStore.getState().play(stationHls);
    const playCallsBefore = audioRegistry.current!.play.mock.calls.length;
    errorHandler?.('hlsError', { fatal: false });
    expect(audioRegistry.current!.play.mock.calls.length).toBe(playCallsBefore);
  });

  it('play() loads via canPlayType when HLS not supported but browser supports m3u8', () => {
    MockHls.isSupported.mockReturnValue(false);
    useStore.getState().play(station); // ensure audio element exists first
    useStore.getState().stop();
    audioRegistry.current!.canPlayType.mockReturnValue('maybe');

    useStore.getState().play(stationHls);

    expect(audioRegistry.current?.src).toBe(stationHls.audio);
    expect(audioRegistry.current?.play).toHaveBeenCalled();
  });

  it('play() falls back to audioA for non-m3u8 src', () => {
    useStore.getState().play(stationWithFallback);
    expect(audioRegistry.current?.src).toBe(stationWithFallback.audioA);
  });

  it('play() uses src when no fallbackSrc', () => {
    useStore.getState().play(station);
    expect(audioRegistry.current?.src).toBe(station.audio);
  });

  it('pause() calls audio.pause()', () => {
    useStore.getState().play(station);
    useStore.getState().pause();
    expect(audioRegistry.current?.pause).toHaveBeenCalled();
  });

  it('resume() calls audio.play()', () => {
    useStore.getState().play(station);
    const callsBefore = audioRegistry.current!.play.mock.calls.length;
    useStore.getState().resume();
    expect(audioRegistry.current!.play.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('stop() clears station and resets state', () => {
    useStore.getState().play(station);
    useStore.getState().stop();
    const state = useStore.getState();
    expect(state.currentStation).toBeNull();
    expect(state.currentSlider).toBeNull();
    expect(state.isPlaying).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.nowPlaying).toBeNull();
    expect(state.sliderLabels).toEqual([]);
    expect(audioRegistry.current?.pause).toHaveBeenCalled();
    expect(audioRegistry.current?.src).toBe('');
  });

  it('stop() destroys existing HLS instance', () => {
    MockHls.isSupported.mockReturnValue(true);
    useStore.getState().play(stationHls);
    useStore.getState().stop();
    expect(mockHlsInstance.destroy).toHaveBeenCalled();
  });

  it('isPlaying becomes true on playing event and false on pause event', () => {
    useStore.getState().play(station);
    audioRegistry.current!.emit('playing');
    expect(useStore.getState().isPlaying).toBe(true);
    expect(useStore.getState().isLoading).toBe(false);

    audioRegistry.current!.emit('pause');
    expect(useStore.getState().isPlaying).toBe(false);
  });

  it('isLoading becomes true on waiting event', () => {
    useStore.getState().play(station);
    audioRegistry.current!.emit('playing');
    audioRegistry.current!.emit('waiting');
    expect(useStore.getState().isLoading).toBe(true);
  });

  it('setVolume() updates volume, clamps to [0, 1], and updates audio element', () => {
    useStore.getState().play(station);

    useStore.getState().setVolume(0.5);
    expect(useStore.getState().volume).toBe(0.5);
    expect(audioRegistry.current?.volume).toBe(0.5);

    useStore.getState().setVolume(2);
    expect(useStore.getState().volume).toBe(1);

    useStore.getState().setVolume(-1);
    expect(useStore.getState().volume).toBe(0);
  });

  it('playSlider() sets currentSlider and loads its audio', () => {
    useStore.getState().play(station);
    useStore.getState().playSlider(slider);
    expect(useStore.getState().currentStation).toEqual(station);
    expect(useStore.getState().currentSlider).toEqual(slider);
    expect(audioRegistry.current?.src).toBe(slider.audio);
  });

  it('playSlider() does nothing without a current station', () => {
    useStore.getState().playSlider(slider);
    expect(useStore.getState().currentStation).toBeNull();
    expect(useStore.getState().currentSlider).toBeNull();
  });

  it('playLive() clears currentSlider and returns to the main stream', () => {
    useStore.getState().play(station);
    useStore.getState().playSlider(slider);
    useStore.getState().playLive();
    expect(useStore.getState().currentSlider).toBeNull();
    expect(audioRegistry.current?.src).toBe(station.audio);
  });

  it('playLive() does nothing without a current station', () => {
    useStore.getState().playLive();
    expect(useStore.getState().currentStation).toBeNull();
  });
});

describe('now playing polling', () => {
  afterEach(() => {
    useStore.getState().stop();
  });

  it('fetches now playing when a station with an info URL starts playing', async () => {
    vi.mocked(fetchNowPlayingJson).mockResolvedValue({ artist: 'Radiohead', name: 'Creep', timestamp: 0, before: 0 });
    const stationWithInfo = { ...station, info: 'https://digital.100fm.co.il/api/nowplaying/s/1' };

    useStore.getState().play(stationWithInfo);

    await waitFor(() => expect(useStore.getState().nowPlaying?.artist).toBe('Radiohead'));
  });

  it('does not set now playing when station has no info URL', () => {
    useStore.getState().play(station);
    expect(useStore.getState().nowPlaying).toBeNull();
  });

  it('resets now playing when a new station starts playing', async () => {
    vi.mocked(fetchNowPlayingJson).mockResolvedValue({ artist: 'Radiohead', name: 'Creep', timestamp: 0, before: 0 });
    const stationWithInfo = { ...station, info: 'https://digital.100fm.co.il/api/nowplaying/s/1' };
    useStore.getState().play(stationWithInfo);
    await waitFor(() => expect(useStore.getState().nowPlaying).not.toBeNull());

    useStore.getState().play(station);
    expect(useStore.getState().nowPlaying).toBeNull();
  });

  it('polls every 30 seconds', async () => {
    vi.useFakeTimers();
    vi.mocked(fetchNowPlayingJson).mockResolvedValue({ artist: 'A', name: 'B', timestamp: 0, before: 0 });
    const stationWithInfo = { ...station, info: 'https://digital.100fm.co.il/api/nowplaying/s/1' };

    useStore.getState().play(stationWithInfo);
    await vi.advanceTimersByTimeAsync(0);
    const callsAfterMount = vi.mocked(fetchNowPlayingJson).mock.calls.length;
    expect(callsAfterMount).toBeGreaterThanOrEqual(1);

    await vi.advanceTimersByTimeAsync(30_000);
    expect(vi.mocked(fetchNowPlayingJson).mock.calls.length).toBeGreaterThan(callsAfterMount);

    vi.useRealTimers();
  });
});

describe('slider labels polling', () => {
  afterEach(() => {
    useStore.getState().stop();
  });

  it('clears sliderLabels for a station without sliders', () => {
    useStore.getState().play(station);
    expect(useStore.getState().sliderLabels).toEqual([]);
  });

  it('uses fallback labels when no info URLs are present', async () => {
    vi.mocked(fetchNowPlayingJson).mockResolvedValue(null);
    const stationWithSliders: Station = { ...station, sliders: [{ audio: 'http://s1' }, { audio: 'http://s2' }] };

    useStore.getState().play(stationWithSliders);

    await waitFor(() => expect(useStore.getState().sliderLabels).toHaveLength(3));
    expect(useStore.getState().sliderLabels).toEqual(['Rock FM #1', 'Rock FM #2', 'Rock FM #3']);
  });

  it('builds "artist — name" labels from fetched live and slider info', async () => {
    vi.mocked(fetchNowPlayingJson).mockResolvedValue({ artist: 'Pink Floyd', name: 'Comfortably Numb' });
    const stationWithSliders: Station = {
      ...station,
      info: 'https://digital.100fm.co.il/api/nowplaying/s/0',
      sliders: [{ audio: 'http://s1', info: 'https://digital.100fm.co.il/api/nowplaying/s/1' }],
    };

    useStore.getState().play(stationWithSliders);

    await waitFor(() => expect(useStore.getState().sliderLabels[1]).toBe('Pink Floyd — Comfortably Numb'));
    expect(useStore.getState().sliderLabels[0]).toBe('Pink Floyd — Comfortably Numb');
  });

  it('falls back to station label when API returns empty data', async () => {
    vi.mocked(fetchNowPlayingJson).mockResolvedValue({ artist: '', name: '' });
    const stationWithSliders: Station = {
      ...station,
      sliders: [{ audio: 'http://s1', info: 'https://digital.100fm.co.il/api/nowplaying/s/1' }],
    };

    useStore.getState().play(stationWithSliders);

    await waitFor(() => expect(useStore.getState().sliderLabels[1]).toBe('Rock FM #2'));
  });
});

describe('loading timeout warning', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    useStore.getState().stop();
    vi.useRealTimers();
  });

  it('becomes visible after loading for 10 seconds', () => {
    useStore.getState().play(station);

    vi.advanceTimersByTime(9_999);
    expect(useStore.getState().loadingTimeoutVisible).toBe(false);

    vi.advanceTimersByTime(1);
    expect(useStore.getState().loadingTimeoutVisible).toBe(true);
  });

  it('hides itself automatically 3 seconds after appearing', () => {
    useStore.getState().play(station);

    vi.advanceTimersByTime(10_000);
    expect(useStore.getState().loadingTimeoutVisible).toBe(true);

    vi.advanceTimersByTime(2_999);
    expect(useStore.getState().loadingTimeoutVisible).toBe(true);

    vi.advanceTimersByTime(1);
    expect(useStore.getState().loadingTimeoutVisible).toBe(false);
  });

  it('clears the pending timeout when audio starts playing', () => {
    useStore.getState().play(station);
    audioRegistry.current!.emit('playing');

    vi.advanceTimersByTime(10_000);
    expect(useStore.getState().loadingTimeoutVisible).toBe(false);
  });

  it('dismissLoadingTimeout hides it manually', () => {
    useStore.getState().play(station);
    vi.advanceTimersByTime(10_000);
    expect(useStore.getState().loadingTimeoutVisible).toBe(true);

    useStore.getState().dismissLoadingTimeout();
    expect(useStore.getState().loadingTimeoutVisible).toBe(false);
  });
});

describe('combined handlers', () => {
  afterEach(() => {
    useStore.getState().stop();
  });

  it('handlePlay starts playback of a new station', () => {
    useStore.getState().handlePlay(station);
    expect(useStore.getState().currentStation).toEqual(station);
    expect(useStore.getState().isLoading).toBe(true);
  });

  it('handlePlay pauses the active station when playing', () => {
    useStore.getState().play(station);
    audioRegistry.current!.emit('playing');

    useStore.getState().handlePlay(station);

    expect(audioRegistry.current?.pause).toHaveBeenCalled();
  });

  it('handlePlay resumes the active station when paused', () => {
    useStore.getState().play(station);
    const callsBefore = audioRegistry.current!.play.mock.calls.length;

    useStore.getState().handlePlay(station);

    expect(audioRegistry.current!.play.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('handlePlay restarts live playback when a slider is active', () => {
    useStore.getState().play(station);
    useStore.getState().playSlider(slider);

    useStore.getState().handlePlay(station);

    expect(useStore.getState().currentSlider).toBeNull();
    expect(audioRegistry.current?.src).toBe(station.audio);
  });

  it('handlePlayPause toggles between pause and resume', () => {
    useStore.getState().play(station);
    audioRegistry.current!.emit('playing');

    useStore.getState().handlePlayPause();
    expect(audioRegistry.current?.pause).toHaveBeenCalled();

    audioRegistry.current!.emit('pause');
    const callsBefore = audioRegistry.current!.play.mock.calls.length;
    useStore.getState().handlePlayPause();
    expect(audioRegistry.current!.play.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('handleSelectSlider plays the slider when a station is active', () => {
    useStore.getState().play(station);
    useStore.getState().handleSelectSlider(slider);
    expect(useStore.getState().currentSlider).toEqual(slider);
  });

  it('handleSelectSlider does nothing without a current station', () => {
    useStore.getState().handleSelectSlider(slider);
    expect(useStore.getState().currentSlider).toBeNull();
  });

  it('handleSelectLive returns to live playback when a station is active', () => {
    useStore.getState().play(station);
    useStore.getState().playSlider(slider);
    useStore.getState().handleSelectLive();
    expect(useStore.getState().currentSlider).toBeNull();
  });

  it('handleSelectLive does nothing without a current station', () => {
    useStore.getState().handleSelectLive();
    expect(useStore.getState().currentStation).toBeNull();
  });
});

describe('persistence and legacy migration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('persists theme, favorites, hidden, volume, and viewMode to localStorage', async () => {
    const { useStore: store } = await import('../store');

    store.getState().handleDarkModeToggle();
    store.getState().toggleFavorite('rock-fm');
    store.getState().toggleHidden('jazz-club');
    store.getState().setVolume(0.4);
    store.getState().setViewMode('list');

    await waitFor(() => expect(localStorage.getItem('100fm-digital-storage')).toBeTruthy());
    const parsed = JSON.parse(localStorage.getItem('100fm-digital-storage')!);

    expect(parsed.state.isDarkMode).toBe(true);
    expect(parsed.state.favorites).toEqual(['rock-fm']);
    expect(parsed.state.hidden).toEqual(['jazz-club']);
    expect(parsed.state.volume).toBe(0.4);
    expect(parsed.state.viewMode).toBe('list');
    expect(parsed.state.search).toBeUndefined();
    expect(parsed.state.stations).toBeUndefined();
  });

  it('migrates legacy per-key localStorage values when the combined key is absent', async () => {
    localStorage.setItem('100fm_dark_mode', JSON.stringify(true));
    localStorage.setItem('100fm_favorites', JSON.stringify(['jazz-club']));
    localStorage.setItem('100fm_hidden', JSON.stringify(['classical']));
    localStorage.setItem('100fm_volume', JSON.stringify(0.3));
    localStorage.setItem('viewMode', 'list');

    const { useStore: store } = await import('../store');

    expect(store.getState().isDarkMode).toBe(true);
    expect(store.getState().favorites).toEqual(['jazz-club']);
    expect(store.getState().hidden).toEqual(['classical']);
    expect(store.getState().volume).toBe(0.3);
    expect(store.getState().viewMode).toBe('list');
  });

  it('prefers the combined storage key over legacy keys when both exist', async () => {
    localStorage.setItem('100fm_dark_mode', JSON.stringify(false));
    localStorage.setItem(
      '100fm-digital-storage',
      JSON.stringify({
        state: { isDarkMode: true, favorites: [], hidden: [], volume: 0.6, viewMode: 'grid' },
        version: 0,
      }),
    );

    const { useStore: store } = await import('../store');

    await waitFor(() => expect(store.getState().isDarkMode).toBe(true));
    expect(store.getState().volume).toBe(0.6);
  });

  it('falls back to defaults when no legacy or combined storage exists', async () => {
    const { useStore: store } = await import('../store');

    expect(store.getState().isDarkMode).toBe(false);
    expect(store.getState().favorites).toEqual([]);
    expect(store.getState().hidden).toEqual([]);
    expect(store.getState().volume).toBe(0.8);
    expect(store.getState().viewMode).toBe('grid');
  });
});
