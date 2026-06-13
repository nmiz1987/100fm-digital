import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMediaSession } from '../useMediaSession';
import { useStore } from '../../store/store';
import type { Station, NowPlaying } from '../../types';

const makeStation = (slug: string, name: string): Station => ({
  name,
  audio: `http://stream/${slug}`,
  slug,
  logo: `${slug}.png`,
});

const stationA = makeStation('a', 'A');
const stationB = makeStation('b', 'B');
const stationC = makeStation('c', 'C');
const stations = [stationA, stationB, stationC];

class MockMediaMetadata {
  title?: string;
  artist?: string;
  album?: string;
  artwork?: unknown;
  constructor(init: { title?: string; artist?: string; album?: string; artwork?: unknown }) {
    Object.assign(this, init);
  }
}

let actionHandlers: Record<string, (() => void) | null>;
let mediaSessionMock: { setActionHandler: ReturnType<typeof vi.fn>; metadata: MockMediaMetadata | null };

beforeEach(() => {
  useStore.setState({
    stations,
    tab: 'all',
    search: '',
    favorites: [],
    hidden: [],
    currentStation: null,
    nowPlaying: null,
  });

  actionHandlers = {};
  mediaSessionMock = {
    setActionHandler: vi.fn((action: string, handler: (() => void) | null) => {
      actionHandlers[action] = handler;
    }),
    metadata: null,
  };

  vi.stubGlobal('MediaMetadata', MockMediaMetadata);
  Object.defineProperty(navigator, 'mediaSession', {
    value: mediaSessionMock,
    configurable: true,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useMediaSession', () => {
  it('does nothing when mediaSession is not supported', () => {
    // @ts-expect-error -- simulate a browser without the Media Session API
    delete navigator.mediaSession;

    const { unmount } = renderHook(() => useMediaSession());
    expect(mediaSessionMock.setActionHandler).not.toHaveBeenCalled();
    unmount();

    // restore so the automatic RTL cleanup (and other tests) see a valid mediaSession
    Object.defineProperty(navigator, 'mediaSession', { value: mediaSessionMock, configurable: true });
  });

  it('registers nexttrack and previoustrack handlers', () => {
    renderHook(() => useMediaSession());
    expect(mediaSessionMock.setActionHandler).toHaveBeenCalledWith('nexttrack', expect.any(Function));
    expect(mediaSessionMock.setActionHandler).toHaveBeenCalledWith('previoustrack', expect.any(Function));
  });

  it('clears the action handlers on unmount', () => {
    const { unmount } = renderHook(() => useMediaSession());
    unmount();
    expect(mediaSessionMock.setActionHandler).toHaveBeenCalledWith('nexttrack', null);
    expect(mediaSessionMock.setActionHandler).toHaveBeenCalledWith('previoustrack', null);
  });

  it('plays the next station in the filtered list on nexttrack', () => {
    useStore.setState({ currentStation: stationA });
    renderHook(() => useMediaSession());
    actionHandlers.nexttrack?.();
    expect(useStore.getState().currentStation).toEqual(stationB);
  });

  it('plays the previous station in the filtered list on previoustrack', () => {
    useStore.setState({ currentStation: stationA });
    renderHook(() => useMediaSession());
    actionHandlers.previoustrack?.();
    expect(useStore.getState().currentStation).toEqual(stationC);
  });

  it('wraps around when going next from the last station', () => {
    useStore.setState({ currentStation: stationC });
    renderHook(() => useMediaSession());
    actionHandlers.nexttrack?.();
    expect(useStore.getState().currentStation).toEqual(stationA);
  });

  it('does nothing when the filtered list is empty', () => {
    useStore.setState({ stations: [] });
    renderHook(() => useMediaSession());
    actionHandlers.nexttrack?.();
    expect(useStore.getState().currentStation).toBeNull();
  });

  it('updates mediaSession metadata when the current station changes', () => {
    renderHook(() => useMediaSession());
    useStore.setState({ currentStation: stationA });

    expect(mediaSessionMock.metadata).toBeInstanceOf(MockMediaMetadata);
    expect(mediaSessionMock.metadata).toMatchObject({ title: 'A', artist: 'A', album: 'A' });
  });

  it('uses nowPlaying info for metadata when available', () => {
    useStore.setState({ currentStation: stationA });
    renderHook(() => useMediaSession());

    const nowPlaying: NowPlaying = { artist: 'Radiohead', name: 'Creep', timestamp: 0, before: 0 };
    useStore.setState({ nowPlaying });

    expect(mediaSessionMock.metadata).toMatchObject({ title: 'Creep', artist: 'Radiohead', album: 'A' });
  });

  it('does not update metadata when there is no current station', () => {
    renderHook(() => useMediaSession());
    useStore.setState({ nowPlaying: { artist: 'Radiohead', name: 'Creep', timestamp: 0, before: 0 } });
    expect(mediaSessionMock.metadata).toBeNull();
  });
});
