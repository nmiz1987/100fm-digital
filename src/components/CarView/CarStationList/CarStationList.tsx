import { useStore } from '../../../store/store';
import type { Station } from '../../../types';
import { useCarStationImage } from '../useCarStationImage';

interface CarStationListProps {
  stations: Station[];
  loading: boolean;
  activeSlug: string | null;
  onSelect: (station: Station) => void;
}

export function CarStationList({ stations, loading, activeSlug, onSelect }: CarStationListProps) {
  const isDarkMode = useStore((state) => state.isDarkMode);

  if (loading) {
    return <div className={`flex-1 flex items-center justify-center text-lg ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>טוען תחנות...</div>;
  }

  if (stations.length === 0) {
    return <div className={`flex-1 flex items-center justify-center text-lg ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>לא נמצאו תחנות</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-3">
      <ul className="flex flex-col gap-2">
        {stations.map((station) => (
          <CarStationListItem
            key={station.slug}
            station={station}
            isDarkMode={isDarkMode}
            isActive={activeSlug === station.slug}
            onSelect={() => onSelect(station)}
          />
        ))}
      </ul>
    </div>
  );
}

function CarStationListItem({
  station,
  darkMode,
  isActive,
  onSelect,
}: {
  station: Station;
  darkMode: boolean;
  isActive: boolean;
  onSelect: () => void;
}) {
  const { imgSrc, onError } = useCarStationImage(station);

  return (
    <li>
      <button
        onClick={onSelect}
        className={`w-full flex items-center gap-4 p-3 rounded-xl text-right transition-colors
          ${isActive ? 'ring-2 ring-[#e8192c]' : ''}
          ${darkMode ? 'bg-[#1a1a1a] hover:bg-[#242424]' : 'bg-white hover:bg-gray-50 border border-gray-200'}`}
      >
        <img src={imgSrc} alt={station.name} onError={onError} className="w-14 h-14 rounded-lg object-cover shrink-0" />
        <span className={`text-lg font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{station.name}</span>
      </button>
    </li>
  );
}
