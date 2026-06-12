import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAppState } from './hooks/useAppState';
import { useElementHeight } from './hooks/useElementHeight';
import { Header } from './components/Header/Header';
import { StationGrid } from './components/StationGrid/StationGrid';
import { PlayerBar } from './components/PlayerBar/PlayerBar';
import { LoadingTimeoutToast } from './components/common/LoadingTimeoutToast';
import { StationsLoader } from './components/common/StationsLoader';
import { NotFound } from './components/common/NotFound';
import { CarApp } from './components/CarView/CarApp';

export default function App() {
  const {
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
  } = useAppState();

  const navigate = useNavigate();
  const [playerBarRef, playerBarHeight] = useElementHeight<HTMLDivElement>();

  const carApp = (
    <CarApp
      darkMode={darkMode}
      stations={stations}
      loading={loading}
      tab={tab}
      search={search}
      favorites={favorites}
      hidden={hidden}
      player={player}
      nowPlaying={nowPlaying}
      sliderLabels={sliderLabels}
      handlePlay={handlePlay}
      handlePlayPause={handlePlayPause}
      handleSelectSlider={handleSelectSlider}
      handleSelectLive={handleSelectLive}
      handleToggleFavorite={handleToggleFavorite}
    />
  );

  return (
    <Routes>
      <Route path="/car" element={carApp} />
      <Route path="/car/:slug" element={carApp} />
      <Route
        path="/"
        element={
          <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#0f0f0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <Header search={search} onSearchChange={setSearch} darkMode={darkMode} onDarkModeToggle={handleDarkModeToggle} onCarModeEnter={() => navigate('/car')} />

            <LoadingTimeoutToast visible={loadingTimeoutWarning.visible} darkMode={darkMode} onDismiss={loadingTimeoutWarning.dismiss} />

            <main
              className="flex-1 flex flex-col"
              style={player.currentStation ? { paddingBottom: playerBarHeight } : undefined}
            >
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
                  tab={tab}
                  setTab={setTab}
                  onPlay={handlePlay}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleHide={handleToggleHide}
                />
              )}
            </main>

            {player.currentStation && (
              <PlayerBar
                ref={playerBarRef}
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
        }
      />
      <Route path="*" element={<NotFound darkMode={darkMode} />} />
    </Routes>
  );
}
