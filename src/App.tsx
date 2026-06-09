import { useAppState } from './hooks/useAppState';
import { Header } from './components/Header/Header';
import { StationGrid } from './components/StationGrid/StationGrid';
import { PlayerBar } from './components/PlayerBar/PlayerBar';
import { LoadingTimeoutToast } from './components/common/LoadingTimeoutToast';
import { StationsLoader } from './components/common/StationsLoader';

export default function App() {
  const {
    darkMode,
    search,
    setSearch,
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
  } = useAppState();

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
          <StationsLoader darkMode={darkMode} />
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
