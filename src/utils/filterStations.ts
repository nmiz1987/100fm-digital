import type { Station } from '../types';

export type Tab = 'all' | 'favorites' | 'popular' | 'hidden';

interface FilterStationsParams {
  tab: Tab;
  search: string;
  favorites: string[];
  hidden: string[];
}

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function filterStations(stations: Station[], { tab, search, favorites, hidden }: FilterStationsParams): Station[] {
  const normalizedSearch = normalize(search);

  return stations.filter((s) => {
    if (tab === 'hidden') {
      if (!hidden.includes(s.slug)) return false;
    } else {
      if (hidden.includes(s.slug)) return false;
      if (tab === 'favorites') return favorites.includes(s.slug);
      if (tab === 'popular') return s.popular === 'true';
    }
    if (search) {
      if (!normalize(s.name).includes(normalizedSearch)) return false;
    }
    return true;
  });
}
