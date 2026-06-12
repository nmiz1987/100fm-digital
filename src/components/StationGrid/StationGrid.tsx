import type { Station } from '../../types';
import type { Tab } from '../../utils/filterStations';
import { StationCard } from '../StationCard/StationCard';
import { ListViewIcon, GridViewIcon } from '../common/icons';
import { useStationGrid } from './useStationGrid';

interface StationGridProps {
  stations: Station[];
  loading: boolean;
  search: string;
  activeSlug: string | null;
  isPlaying: boolean;
  favorites: string[];
  hidden: string[];
  darkMode: boolean;
  tab: Tab;
  setTab: (tab: Tab) => void;
  onPlay: (station: Station) => void;
  onToggleFavorite: (slug: string) => void;
  onToggleHide: (slug: string) => void;
}

export function StationGrid({
  stations,
  search,
  activeSlug,
  isPlaying,
  favorites,
  hidden,
  darkMode,
  tab,
  setTab,
  onPlay,
  onToggleFavorite,
  onToggleHide,
}: StationGridProps) {
  const { viewMode, setViewModePersisted, filtered, tabs } = useStationGrid({
    stations,
    search,
    favorites,
    hidden,
    tab,
    setTab,
  });

  return (
    <div className="flex-1 p-4 max-w-7xl mx-auto w-full">
      {/* Tabs */}
      <div className={`flex items-center gap-1 mb-5 border-b pb-0 overflow-x-auto scrollbar-none ${darkMode ? 'border-white/8' : 'border-gray-200'}`}>
        <div className="flex gap-1 flex-1 overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors relative
                ${tab === t.id ? 'text-[#e8192c]' : darkMode ? 'text-white/50 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'}`}
            >
              {t.label}
              {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e8192c] rounded-t" />}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <button
          className={`shrink-0 p-2 mb-1 rounded-lg transition-colors ${darkMode ? 'text-white/50 hover:text-white/80 hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
          onClick={() => setViewModePersisted(viewMode === 'grid' ? 'list' : 'grid')}
          title={viewMode === 'grid' ? 'תצוגת רשימה' : 'תצוגת רשת'}
        >
          {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className={`text-center py-20 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
          <div className="text-4xl mb-3">📻</div>
          <p className="text-sm">לא נמצאו תחנות</p>
        </div>
      ) : viewMode === 'list' ? (
        <div
          className={`flex flex-col rounded-xl overflow-hidden ${darkMode ? 'divide-y divide-white/5' : 'border border-gray-200 divide-y divide-gray-100'}`}
        >
          {filtered.map((station) => (
            <StationCard
              key={station.slug}
              station={station}
              isActive={activeSlug === station.slug}
              isPlaying={isPlaying && activeSlug === station.slug}
              isFavorite={favorites.includes(station.slug)}
              isHidden={hidden.includes(station.slug)}
              darkMode={darkMode}
              viewMode="list"
              onPlay={() => onPlay(station)}
              onToggleFavorite={() => onToggleFavorite(station.slug)}
              onToggleHide={() => onToggleHide(station.slug)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((station) => (
            <StationCard
              key={station.slug}
              station={station}
              isActive={activeSlug === station.slug}
              isPlaying={isPlaying && activeSlug === station.slug}
              isFavorite={favorites.includes(station.slug)}
              isHidden={hidden.includes(station.slug)}
              darkMode={darkMode}
              onPlay={() => onPlay(station)}
              onToggleFavorite={() => onToggleFavorite(station.slug)}
              onToggleHide={() => onToggleHide(station.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
