import { Routes, Route } from 'react-router-dom';
import { useAppState } from './hooks/useAppState';
import { NotFound } from './components/common/NotFound';
import { CarApp } from './components/CarView/CarApp';
import { Main } from './components/Main/Main';

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
          <Main
            darkMode={darkMode}
            search={search}
            setSearch={setSearch}
            tab={tab}
            setTab={setTab}
            stations={stations}
            loading={loading}
            player={player}
            nowPlaying={nowPlaying}
            sliderLabels={sliderLabels}
            loadingTimeoutWarning={loadingTimeoutWarning}
            favorites={favorites}
            hidden={hidden}
            handleVolumeChange={handleVolumeChange}
            handlePlay={handlePlay}
            handlePlayPause={handlePlayPause}
            handleSelectSlider={handleSelectSlider}
            handleSelectLive={handleSelectLive}
            handleToggleFavorite={handleToggleFavorite}
            handleToggleHide={handleToggleHide}
            handleDarkModeToggle={handleDarkModeToggle}
          />
        }
      />
      <Route path="*" element={<NotFound darkMode={darkMode} />} />
    </Routes>
  );
}
