import { describe, it, expect } from 'vitest';
import { filterStations } from '../filterStations';
import type { Station } from '../../types';

const makeStation = (slug: string, name: string, overrides: Partial<Station> = {}): Station => ({
  name,
  audio: `http://stream/${slug}`,
  slug,
  logo: `${slug}.png`,
  ...overrides,
});

const stations: Station[] = [
  makeStation('one', 'Station One', { popular: 'true' }),
  makeStation('two', 'Station Two'),
  makeStation('three', 'Station Three'),
  makeStation('four', 'Station Four'),
];

describe('filterStations', () => {
  it('excludes hidden stations on the "all" tab, so next/prev skip them', () => {
    const result = filterStations(stations, { tab: 'all', search: '', favorites: [], hidden: ['two'] });
    expect(result.map((s) => s.slug)).toEqual(['one', 'three', 'four']);
  });

  it('returns only favorites on the favorites tab', () => {
    const result = filterStations(stations, { tab: 'favorites', search: '', favorites: ['two', 'four'], hidden: [] });
    expect(result.map((s) => s.slug)).toEqual(['two', 'four']);
  });

  it('returns only popular stations on the popular tab', () => {
    const result = filterStations(stations, { tab: 'popular', search: '', favorites: [], hidden: [] });
    expect(result.map((s) => s.slug)).toEqual(['one']);
  });

  it('returns only hidden stations on the hidden tab', () => {
    const result = filterStations(stations, { tab: 'hidden', search: '', favorites: [], hidden: ['two', 'three'] });
    expect(result.map((s) => s.slug)).toEqual(['two', 'three']);
  });

  it('applies search within the active tab', () => {
    const result = filterStations(stations, { tab: 'all', search: 'Three', favorites: [], hidden: [] });
    expect(result.map((s) => s.slug)).toEqual(['three']);
  });
});
