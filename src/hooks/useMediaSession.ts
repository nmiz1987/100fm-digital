import { useEffect } from 'react';
import { useStore } from '../store/store';
import { filterStations } from '../utils/filterStations';

export function useMediaSession() {
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const navigate = (offset: number) => {
      const { stations, tab, search, favorites, hidden, currentStation, play } = useStore.getState();
      const list = filterStations(stations, { tab, search, favorites, hidden });
      if (!list.length) return;
      const idx = list.findIndex((s) => s.slug === currentStation?.slug);
      const base = idx === -1 ? 0 : idx;
      play(list[(base + offset + list.length) % list.length]);
    };

    navigator.mediaSession.setActionHandler('nexttrack', () => navigate(1));
    navigator.mediaSession.setActionHandler('previoustrack', () => navigate(-1));
    return () => {
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
    };
  }, []);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    return useStore.subscribe((state, prevState) => {
      if (!state.currentStation) return;
      if (state.currentStation === prevState.currentStation && state.nowPlaying === prevState.nowPlaying) return;

      navigator.mediaSession.metadata = new MediaMetadata({
        title: state.nowPlaying?.name ?? state.currentStation.name,
        artist: state.nowPlaying?.artist ?? state.currentStation.name,
        album: state.currentStation.name,
        artwork: [{ src: state.currentStation.cover ?? state.currentStation.logo, sizes: '512x512', type: 'image/png' }],
      });
    });
  }, []);
}
