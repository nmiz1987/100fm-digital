import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../store/store';
import type { Station } from '../../../types';
import { useCarStationImage } from '../hooks/useCarStationImage';

interface CarStationListItemProps {
  station: Station;
}

export function CarStationListItem({ station }: CarStationListItemProps) {
  const navigate = useNavigate();
  const { imgSrc, onError } = useCarStationImage(station);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const isActive = useStore((state) => state.currentStation?.slug === station.slug);
  const handlePlay = useStore((state) => state.handlePlay);

  const onSelect = () => {
    handlePlay(station);
    navigate(`/car/${station.slug}`);
  };

  return (
    <li>
      <button
        onClick={onSelect}
        className={`w-full flex items-center gap-4 p-3 rounded-xl text-right transition-colors
          ${isActive ? 'ring-2 ring-[#e8192c]' : ''}
          ${isDarkMode ? 'bg-[#1a1a1a] hover:bg-[#242424]' : 'bg-white hover:bg-gray-50 border border-gray-200'}`}
      >
        <img src={imgSrc} alt={station.name} onError={onError} className="w-14 h-14 rounded-lg object-cover shrink-0" />
        <span className={`text-lg font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{station.name}</span>
      </button>
    </li>
  );
}
