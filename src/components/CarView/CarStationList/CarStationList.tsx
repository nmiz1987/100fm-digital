import { useShallow } from 'zustand/react/shallow';
import { useStore, getFilteredStations } from '../../../store/store';
import { CarStationListItem } from './CarStationListItem/CarStationListItem';

export function CarStationList() {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const stationsLoading = useStore((state) => state.stationsLoading);
  const stations = useStore(useShallow(getFilteredStations));

  if (stationsLoading) {
    return <div className={`flex-1 flex items-center justify-center text-lg ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>טוען תחנות...</div>;
  }

  if (stations.length === 0) {
    return <div className={`flex-1 flex items-center justify-center text-lg ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>לא נמצאו תחנות</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-3">
      <ul className="flex flex-col gap-2">
        {stations.map((station) => (
          <CarStationListItem key={station.slug} station={station} />
        ))}
      </ul>
    </div>
  );
}
