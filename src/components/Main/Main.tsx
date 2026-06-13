import { useNavigate } from 'react-router-dom';
import { LoadingTimeoutToast } from '../common/LoadingTimeoutToast';
import { StationsLoader } from '../common/StationsLoader';
import { Header } from '../Header/Header';
import { PlayerBar } from '../PlayerBar/PlayerBar';
import { StationGrid } from '../StationGrid/StationGrid';
import { useElementHeight } from '../../hooks/useElementHeight';
import { useStore } from '../../store/store';

export const Main = () => {
  const navigate = useNavigate();
  const [playerBarRef, playerBarHeight] = useElementHeight<HTMLDivElement>();
  const isDarkMode = useStore((state) => state.isDarkMode);
  const stationsLoading = useStore((state) => state.stationsLoading);
  const hasCurrentStation = useStore((state) => state.currentStation !== null);

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-[#0f0f0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header onCarModeEnter={() => navigate('/car')} />

      <LoadingTimeoutToast />

      <main className="flex-1 flex flex-col" style={hasCurrentStation ? { paddingBottom: playerBarHeight } : undefined}>
        {stationsLoading ? <StationsLoader /> : <StationGrid />}
      </main>

      {hasCurrentStation && <PlayerBar ref={playerBarRef} />}
    </div>
  );
};
