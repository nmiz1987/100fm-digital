import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import type { Station } from '../../../types';
import { useStore, getFilteredStations } from '../../../store/store';

export function useCarStationInfo(station: Station) {
  const navigate = useNavigate();
  const filteredList = useStore(useShallow(getFilteredStations));
  const handlePlay = useStore((state) => state.handlePlay);

  const idx = filteredList.findIndex((s) => s.slug === station.slug);
  const hasMultiple = filteredList.length > 1;

  const goToOffset = (offset: number) => {
    if (filteredList.length === 0) return;
    const base = idx === -1 ? 0 : idx;
    const targetIdx = idx === -1 ? base : (base + offset + filteredList.length) % filteredList.length;
    const target = filteredList[targetIdx];
    handlePlay(target);
    navigate(`/car/${target.slug}`);
  };

  const goNext = () => goToOffset(1);
  const goPrev = () => goToOffset(-1);

  return { goNext, goPrev, hasMultiple };
}
