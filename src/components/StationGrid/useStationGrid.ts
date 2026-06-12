import { useState } from 'react';
import type { Station } from '../../types';
import { filterStations, type Tab } from '../../utils/filterStations';

export type { Tab };

interface UseStationGridParams {
  stations: Station[];
  search: string;
  favorites: string[];
  hidden: string[];
  tab: Tab;
  setTab: (tab: Tab) => void;
}

export function useStationGrid({ stations, search, favorites, hidden, tab, setTab }: UseStationGridParams) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    () => (localStorage.getItem('viewMode') as 'grid' | 'list') ?? 'grid',
  );

  const setViewModePersisted = (mode: 'grid' | 'list') => {
    localStorage.setItem('viewMode', mode);
    setViewMode(mode);
  };

  const filtered = filterStations(stations, { tab, search, favorites, hidden });

  const hiddenCount = stations.filter((s) => hidden.includes(s.slug)).length;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'הכל' },
    { id: 'favorites', label: `מועדפים${favorites.length ? ` (${favorites.length})` : ''}` },
    { id: 'popular', label: 'פופולרי' },
    ...(hiddenCount > 0 ? [{ id: 'hidden' as Tab, label: `מוסתרות (${hiddenCount})` }] : []),
  ];

  return { tab, setTab, viewMode, setViewModePersisted, filtered, tabs };
}
