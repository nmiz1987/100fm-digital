import { useNavigate, useParams } from 'react-router-dom';
import { CarHeader } from './CarHeader';
import { CarStationList } from './CarStationList/CarStationList';
import { CarStationInfo } from './CarStationInfo/CarStationInfo';
import { useStore } from '../../store/store';

export function CarApp() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const isDarkMode = useStore((state) => state.isDarkMode);
  const stations = useStore((state) => state.stations);
  const stationsLoading = useStore((state) => state.stationsLoading);

  const station = slug ? (stations.find((s) => s.slug === slug) ?? null) : null;

  return (
    <div className={`car-mode min-h-screen flex flex-col ${isDarkMode ? 'bg-[#0f0f0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <CarHeader darkMode={isDarkMode} onExit={() => navigate('/')} onBack={slug ? () => navigate('/car') : undefined} />
      {!slug ? (
        <CarStationList />
      ) : station ? (
        <CarStationInfo station={station} />
      ) : !stationsLoading ? (
        <div className={`flex-1 flex flex-col items-center justify-center gap-3 text-lg ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
          <p>התחנה לא נמצאה</p>
          <button onClick={() => navigate('/car')} className="text-[#e8192c] underline">
            חזרה לרשימת התחנות
          </button>
        </div>
      ) : null}
    </div>
  );
}
