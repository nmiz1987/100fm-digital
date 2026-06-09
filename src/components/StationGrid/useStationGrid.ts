import { useState } from 'react';
import type { Station } from '../../types';

export type Tab = 'all' | 'favorites' | 'popular' | 'hidden';

interface UseStationGridParams {
  stations: Station[];
  search: string;
  favorites: string[];
  hidden: string[];
}

export function useStationGrid({ stations, search, favorites, hidden }: UseStationGridParams) {
  const [tab, setTab] = useState<Tab>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    () => (localStorage.getItem('viewMode') as 'grid' | 'list') ?? 'grid',
  );

  const setViewModePersisted = (mode: 'grid' | 'list') => {
    localStorage.setItem('viewMode', mode);
    setViewMode(mode);
  };

  const normalizedSearch = search.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const filtered = stations.filter((s) => {
    if (tab === 'hidden') {
      if (!hidden.includes(s.slug)) return false;
    } else {
      if (hidden.includes(s.slug)) return false;
      if (tab === 'favorites') return favorites.includes(s.slug);
      if (tab === 'popular') return s.popular === 'true';
    }
    if (search) {
      const name = s.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      if (!name.includes(normalizedSearch)) return false;
    }
    return true;
  });

  const hiddenCount = stations.filter((s) => hidden.includes(s.slug)).length;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'הכל' },
    { id: 'favorites', label: `מועדפים${favorites.length ? ` (${favorites.length})` : ''}` },
    { id: 'popular', label: 'פופולרי' },
    ...(hiddenCount > 0 ? [{ id: 'hidden' as Tab, label: `מוסתרות (${hiddenCount})` }] : []),
  ];

  return { tab, setTab, viewMode, setViewModePersisted, filtered, tabs };
}
