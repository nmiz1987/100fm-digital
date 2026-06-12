import { useState, useEffect, useRef } from 'react';
import { useStations } from './useStations';
import { usePlayer } from './usePlayer';
import { useNowPlaying } from './useNowPlaying';
import { useSliderLabels } from './useSliderLabels';
import { useLocalStorage } from './useLocalStorage';
import { useLoadingTimeoutWarning } from './useLoadingTimeoutWarning';
import { filterStations, type Tab } from '../utils/filterStations';
import type { Slider, Station } from '../types';

export function useAppState() {
  const [darkMode, setDarkMode] = useLocalStorage('100fm_dark_mode', true);
  const [favorites, setFavorites] = useLocalStorage<string[]>('100fm_favorites', []);
  const [hidden, setHidden] = useLocalStorage<string[]>('100fm_hidden', []);
  const [volume, setVolumeStorage] = useLocalStorage('100fm_volume', 0.8);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('all');

  const { stations, loading } = useStations();
  const player = usePlayer(volume);

  const activeInfoUrl = player.currentSlider?.info ?? player.currentStation?.info;
  const nowPlaying = useNowPlaying(activeInfoUrl);
  const sliderLabels = useSliderLabels(player.currentStation ?? undefined);
  const loadingTimeoutWarning = useLoadingTimeoutWarning(player.isLoading);

  const handleVolumeChange = (v: number) => {
    player.setVolume(v);
    setVolumeStorage(v);
  };

  const handlePlay = (station: Station) => {
    if (player.currentStation?.slug === station.slug && !player.currentSlider) {
      if (player.isPlaying) player.pause();
      else player.resume();
    } else {
      player.play(station);
    }
  };

  const handlePlayPause = () => {
    if (player.isPlaying) player.pause();
    else player.resume();
  };

  const handleSelectSlider = (slider: Slider) => {
    if (player.currentStation) player.playSlider(slider, player.currentStation);
  };

  const handleSelectLive = () => {
    if (player.currentStation) player.playLive(player.currentStation);
  };

  const handleToggleFavorite = (slug: string) => {
    setFavorites((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

  const handleToggleHide = (slug: string) => {
    setHidden((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
    if (player.currentStation?.slug === slug) player.stop();
  };

  const handleDarkModeToggle = () => {
    setDarkMode((prev) => !prev);
  };

  // Keep a ref so Media Session handlers always see fresh state without re-registering
  const navigateRef = useRef<{ next: () => void; prev: () => void }>({ next: () => {}, prev: () => {} });

  useEffect(() => {
    const list = filterStations(stations, { tab, search, favorites, hidden });
    const idx = list.findIndex((s) => s.slug === player.currentStation?.slug);
    navigateRef.current = {
      next: () => {
        if (list.length) player.play(list[(idx + 1) % list.length]);
      },
      prev: () => {
        if (list.length) player.play(list[(idx - 1 + list.length) % list.length]);
      },
    };
  }, [stations, tab, search, favorites, hidden, player.currentStation?.slug, player]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('nexttrack', () => navigateRef.current.next());
    navigator.mediaSession.setActionHandler('previoustrack', () => navigateRef.current.prev());
    return () => {
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
    };
  }, []);

  useEffect(() => {
    if (!('mediaSession' in navigator) || !player.currentStation) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: nowPlaying?.name ?? player.currentStation.name,
      artist: nowPlaying?.artist ?? player.currentStation.name,
      album: player.currentStation?.name ?? '100FM Digital',
      artwork: [{ src: player.currentStation.cover ?? player.currentStation.logo, sizes: '512x512', type: 'image/png' }],
    });
  }, [player.currentStation, nowPlaying]);

  // Applied during render (not in an effect) to avoid a flash of wrong theme on load
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return {
    darkMode,
    search,
    setSearch,
    tab,
    setTab,
    stations,
    loading,
    player,
    nowPlaying,
    sliderLabels,
    loadingTimeoutWarning,
    favorites,
    hidden,
    handleVolumeChange,
    handlePlay,
    handlePlayPause,
    handleSelectSlider,
    handleSelectLive,
    handleToggleFavorite,
    handleToggleHide,
    handleDarkModeToggle,
  };
}
