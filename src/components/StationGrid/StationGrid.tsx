import { useShallow } from 'zustand/react/shallow';
import { useStore, getFilteredStations } from '../../store/store';
import type { Tab } from '../../utils/filterStations';
import { StationCard } from '../StationCard/StationCard';
import { ListViewIcon, GridViewIcon } from '../common/icons';

export function StationGrid() {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const tab = useStore((state) => state.tab);
  const setTab = useStore((state) => state.setTab);
  const viewMode = useStore((state) => state.viewMode);
  const setViewMode = useStore((state) => state.setViewMode);
  const favorites = useStore((state) => state.favorites);
  const hidden = useStore((state) => state.hidden);
  const stations = useStore((state) => state.stations);
  const filtered = useStore(useShallow(getFilteredStations));

  const hiddenCount = stations.filter((s) => hidden.includes(s.slug)).length;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'הכל' },
    { id: 'favorites', label: `מועדפים${favorites.length ? ` (${favorites.length})` : ''}` },
    { id: 'popular', label: 'פופולרי' },
    ...(hiddenCount > 0 ? [{ id: 'hidden' as Tab, label: `מוסתרות (${hiddenCount})` }] : []),
  ];

  return (
    <div className="flex-1 p-4 max-w-7xl mx-auto w-full">
      {/* Tabs */}
      <div
        className={`flex items-center gap-1 mb-5 border-b pb-0 overflow-x-auto scrollbar-none ${isDarkMode ? 'border-white/8' : 'border-gray-200'}`}
      >
        <div className="flex gap-1 flex-1 overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors relative
                ${tab === t.id ? 'text-[#e8192c]' : isDarkMode ? 'text-white/50 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'}`}
            >
              {t.label}
              {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e8192c] rounded-t" />}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <button
          className={`shrink-0 p-2 mb-1 rounded-lg transition-colors ${isDarkMode ? 'text-white/50 hover:text-white/80 hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          title={viewMode === 'grid' ? 'תצוגת רשימה' : 'תצוגת רשת'}
        >
          {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className={`text-center py-20 ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
          <div className="text-4xl mb-3">📻</div>
          <p className="text-sm">לא נמצאו תחנות</p>
        </div>
      ) : viewMode === 'list' ? (
        <div
          className={`flex flex-col rounded-xl overflow-hidden ${isDarkMode ? 'divide-y divide-white/5' : 'border border-gray-200 divide-y divide-gray-100'}`}
        >
          {filtered.map((station) => (
            <StationCard key={station.slug} station={station} viewMode="list" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((station) => (
            <StationCard key={station.slug} station={station} />
          ))}
        </div>
      )}
    </div>
  );
}
