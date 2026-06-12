import { useNavigate } from 'react-router-dom';
import { LoadingTimeoutToast } from '../common/LoadingTimeoutToast';
import { StationsLoader } from '../common/StationsLoader';
import { Header } from '../Header/Header';
import { PlayerBar } from '../PlayerBar/PlayerBar';
import { StationGrid } from '../StationGrid/StationGrid';
import { useElementHeight } from '../../hooks/useElementHeight';
import { Slider, Station } from '../../types';
import { Tab } from '../StationGrid/useStationGrid';
import { useNowPlaying } from '../../hooks/useNowPlaying';
import { usePlayer } from '../../hooks/usePlayer';
import { useSliderLabels } from '../../hooks/useSliderLabels';

interface MainProps {
  darkMode: boolean;
  search: string;
  setSearch: (value: string) => void;
  setTab: (value: Tab) => void;
  tab: Tab;
  handleDarkModeToggle: () => void;
  loadingTimeoutWarning: {
    visible: boolean;
    dismiss: () => void;
  };
  player: ReturnType<typeof usePlayer>;
  loading: boolean;
  stations: Station[];
  favorites: string[];
  hidden: string[];
  handlePlay: (station: Station) => void;
  handleToggleFavorite: (slug: string) => void;
  handleToggleHide: (slug: string) => void;
  nowPlaying: ReturnType<typeof useNowPlaying>;
  handlePlayPause: () => void;
  handleVolumeChange: (v: number) => void;
  sliderLabels: ReturnType<typeof useSliderLabels>;
  handleSelectLive: () => void;
  handleSelectSlider: (slider: Slider) => void;
}

export const Main = ({
  darkMode,
  search,
  setSearch,
  setTab,
  tab,
  handleDarkModeToggle,
  loadingTimeoutWarning,
  player,
  loading,
  stations,
  favorites,
  hidden,
  handlePlay,
  handleToggleFavorite,
  handleToggleHide,
  nowPlaying,
  handlePlayPause,
  handleVolumeChange,
  sliderLabels,
  handleSelectLive,
  handleSelectSlider,
}: MainProps) => {
  const navigate = useNavigate();
  const [playerBarRef, playerBarHeight] = useElementHeight<HTMLDivElement>();

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#0f0f0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header
        search={search}
        onSearchChange={setSearch}
        darkMode={darkMode}
        onDarkModeToggle={handleDarkModeToggle}
        onCarModeEnter={() => navigate('/car')}
      />

      <LoadingTimeoutToast visible={loadingTimeoutWarning.visible} darkMode={darkMode} onDismiss={loadingTimeoutWarning.dismiss} />

      <main className="flex-1 flex flex-col" style={player.currentStation ? { paddingBottom: playerBarHeight } : undefined}>
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
  );
};
