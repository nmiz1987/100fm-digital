import type { Station } from '../../../types';

interface UseCarStationInfoParams {
  station: Station;
  filteredList: Station[];
  handlePlay: (station: Station) => void;
  onNavigate: (station: Station) => void;
}

export function useCarStationInfo({ station, filteredList, handlePlay, onNavigate }: UseCarStationInfoParams) {
  const idx = filteredList.findIndex((s) => s.slug === station.slug);
  const hasMultiple = filteredList.length > 1;

  const goToOffset = (offset: number) => {
    if (filteredList.length === 0) return;
    const base = idx === -1 ? 0 : idx;
    const targetIdx = idx === -1 ? base : (base + offset + filteredList.length) % filteredList.length;
    const target = filteredList[targetIdx];
    handlePlay(target);
    onNavigate(target);
  };

  const goNext = () => goToOffset(1);
  const goPrev = () => goToOffset(-1);

  return { goNext, goPrev, hasMultiple };
}
