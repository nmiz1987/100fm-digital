import { useNavigate, useParams } from 'react-router-dom';
import type { Station, Slider, NowPlaying } from '../../types';
import type { Tab } from '../../utils/filterStations';
import type { usePlayer } from '../../hooks/usePlayer';
import { filterStations } from '../../utils/filterStations';
import { CarHeader } from './CarHeader';
import { CarStationList } from './CarStationList/CarStationList';
import { CarStationInfo } from './CarStationInfo/CarStationInfo';

interface CarAppProps {
  darkMode: boolean;
  stations: Station[];
  loading: boolean;
  tab: Tab;
  search: string;
  favorites: string[];
  hidden: string[];
  player: ReturnType<typeof usePlayer>;
  nowPlaying: NowPlaying | null;
  sliderLabels: string[];
  handlePlay: (station: Station) => void;
  handlePlayPause: () => void;
  handleSelectSlider: (slider: Slider) => void;
  handleSelectLive: () => void;
  handleToggleFavorite: (slug: string) => void;
}

export function CarApp({
  darkMode,
  stations,
  loading,
  tab,
  search,
  favorites,
  hidden,
  player,
  nowPlaying,
  sliderLabels,
  handlePlay,
  handlePlayPause,
  handleSelectSlider,
  handleSelectLive,
  handleToggleFavorite,
}: CarAppProps) {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();

  const filtered = filterStations(stations, { tab, search, favorites, hidden });
  const station = slug ? stations.find((s) => s.slug === slug) ?? null : null;

  return (
    <div className={`car-mode min-h-screen flex flex-col ${darkMode ? 'bg-[#0f0f0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <CarHeader darkMode={darkMode} onExit={() => navigate('/')} onBack={slug ? () => navigate('/car') : undefined} />
      {!slug ? (
        <CarStationList
          stations={filtered}
          loading={loading}
          darkMode={darkMode}
          activeSlug={player.currentStation?.slug ?? null}
          onSelect={(s) => {
            handlePlay(s);
            navigate(`/car/${s.slug}`);
          }}
        />
      ) : station ? (
        <CarStationInfo
          station={station}
          filteredList={filtered}
          darkMode={darkMode}
          player={player}
          nowPlaying={nowPlaying}
          sliderLabels={sliderLabels}
          favorites={favorites}
          handlePlay={handlePlay}
          handlePlayPause={handlePlayPause}
          handleSelectSlider={handleSelectSlider}
          handleSelectLive={handleSelectLive}
          handleToggleFavorite={handleToggleFavorite}
          onNavigate={(s) => navigate(`/car/${s.slug}`)}
        />
      ) : !loading ? (
        <div className={`flex-1 flex flex-col items-center justify-center gap-3 text-lg ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
          <p>התחנה לא נמצאה</p>
          <button onClick={() => navigate('/car')} className="text-[#e8192c] underline">
            חזרה לרשימת התחנות
          </button>
        </div>
      ) : null}
    </div>
  );
}
