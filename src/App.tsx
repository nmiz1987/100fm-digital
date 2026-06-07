import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { StationGrid } from './components/StationGrid';
import { PlayerBar } from './components/PlayerBar';
import { LoadingTimeoutToast } from './components/LoadingTimeoutToast';
import { useStations } from './hooks/useStations';
import { usePlayer } from './hooks/usePlayer';
import { useNowPlaying } from './hooks/useNowPlaying';
import { useSliderLabels } from './hooks/useSliderLabels';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useLoadingTimeoutWarning } from './hooks/useLoadingTimeoutWarning';
import type { Slider, Station } from './types';

export default function App() {
  const [darkMode, setDarkMode] = useLocalStorage('100fm_dark_mode', true);
  const [favorites, setFavorites] = useLocalStorage<string[]>('100fm_favorites', []);
  const [hidden, setHidden] = useLocalStorage<string[]>('100fm_hidden', []);
  const [volume, setVolumeStorage] = useLocalStorage('100fm_volume', 0.8);
  const [search, setSearch] = useState('');

  const { stations, loading } = useStations();
  const player = usePlayer(volume);

  const activeInfoUrl = player.currentSlider?.info ?? player.currentStation?.info;
  const nowPlaying = useNowPlaying(activeInfoUrl);
  const sliderLabels = useSliderLabels(player.currentStation?.sliders, player.currentStation?.name ?? '');
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
    const visible = stations.filter((s) => !hidden.includes(s.slug));
    const idx = visible.findIndex((s) => s.slug === player.currentStation?.slug);
    navigateRef.current = {
      next: () => {
        if (visible.length) player.play(visible[(idx + 1) % visible.length]);
      },
      prev: () => {
        if (visible.length) player.play(visible[(idx - 1 + visible.length) % visible.length]);
      },
    };
  }, [stations, hidden, player.currentStation?.slug, player]);

  // Register Media Session action handlers once
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('nexttrack', () => navigateRef.current.next());
    navigator.mediaSession.setActionHandler('previoustrack', () => navigateRef.current.prev());
    return () => {
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
    };
  }, []);

  // Update Media Session metadata when station or track changes
  useEffect(() => {
    if (!('mediaSession' in navigator) || !player.currentStation) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: nowPlaying?.name ?? player.currentStation.name,
      artist: nowPlaying?.artist ?? player.currentStation.name,
      album: '100FM Digital',
      artwork: [{ src: player.currentStation.cover ?? player.currentStation.logo, sizes: '512x512', type: 'image/png' }],
    });
  }, [player.currentStation, nowPlaying]);

  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#0f0f0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header search={search} onSearchChange={setSearch} darkMode={darkMode} onDarkModeToggle={handleDarkModeToggle} />

      <LoadingTimeoutToast
        visible={loadingTimeoutWarning.visible}
        darkMode={darkMode}
        onDismiss={loadingTimeoutWarning.dismiss}
      />

      <main className={`flex-1 flex flex-col ${player.currentStation ? 'pb-35' : ''}`}>
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className={`w-12 h-12 rounded-full border-4 border-t-[#e8192c] animate-spin ${darkMode ? 'border-white/10' : 'border-gray-200'}`} />
            <p className={`text-sm ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>טוען תחנות...</p>
          </div>
        ) : (
          <StationGrid
            stations={stations}
            loading={false}
            search={search}
            activeSlug={player.currentStation?.slug ?? null}
            isPlaying={player.isPlaying}
            favorites={favorites}
            hidden={hidden}
            darkMode={darkMode}
            onPlay={handlePlay}
            onToggleFavorite={handleToggleFavorite}
            onToggleHide={handleToggleHide}
          />
        )}
      </main>

      {player.currentStation && (
        <PlayerBar
          station={player.currentStation}
          currentSlider={player.currentSlider}
          nowPlaying={nowPlaying}
          isPlaying={player.isPlaying}
          isLoading={player.isLoading}
          volume={player.volume}
          isFavorite={favorites.includes(player.currentStation.slug)}
          darkMode={darkMode}
          onPlayPause={handlePlayPause}
          onStop={player.stop}
          onVolumeChange={handleVolumeChange}
          onToggleFavorite={() => handleToggleFavorite(player.currentStation!.slug)}
          sliderLabels={sliderLabels}
          onSelectLive={handleSelectLive}
          onSelectSlider={handleSelectSlider}
        />
      )}
    </div>
  );
}
