import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useCarStationInfo } from '../useCarStationInfo.hooks';
import type { Station } from '../../../../types';
import { useStore } from '../../../../store/store';

const makeStation = (slug: string, name: string): Station => ({
  name,
  audio: `http://stream/${slug}`,
  slug,
  logo: `${slug}.png`,
});

const stationA = makeStation('a', 'A');
const stationB = makeStation('b', 'B');
const stationC = makeStation('c', 'C');

const stations = [stationA, stationB, stationC];

beforeEach(() => {
  useStore.setState({
    stations,
    tab: 'all',
    search: '',
    favorites: [],
    hidden: [],
    currentStation: null,
  });
});

describe('useCarStationInfo', () => {
  it('goNext plays and navigates to the next station in the list', () => {
    const { result } = renderHook(() => useCarStationInfo(stationA), { wrapper: MemoryRouter });

    result.current.goNext();

    expect(useStore.getState().currentStation).toEqual(stationB);
  });

  it('goPrev plays and navigates to the previous station in the list', () => {
    const { result } = renderHook(() => useCarStationInfo(stationA), { wrapper: MemoryRouter });

    result.current.goPrev();

    expect(useStore.getState().currentStation).toEqual(stationC);
  });

  it('wraps around when going next from the last station', () => {
    const { result } = renderHook(() => useCarStationInfo(stationC), { wrapper: MemoryRouter });

    result.current.goNext();

    expect(useStore.getState().currentStation).toEqual(stationA);
  });

  it('hasMultiple is false for a single-station list', () => {
    useStore.setState({ stations: [stationA] });
    const { result } = renderHook(() => useCarStationInfo(stationA), { wrapper: MemoryRouter });

    expect(result.current.hasMultiple).toBe(false);
  });

  it('hasMultiple is true for a multi-station list', () => {
    const { result } = renderHook(() => useCarStationInfo(stationA), { wrapper: MemoryRouter });

    expect(result.current.hasMultiple).toBe(true);
  });

  it('falls back to index 0 when the current station is not in the filtered list', () => {
    const stationD = makeStation('d', 'D');
    const { result } = renderHook(() => useCarStationInfo(stationD), { wrapper: MemoryRouter });

    result.current.goNext();

    expect(useStore.getState().currentStation).toEqual(stationA);
  });

  it('does nothing when the filtered list is empty', () => {
    useStore.setState({ stations: [] });
    const { result } = renderHook(() => useCarStationInfo(stationA), { wrapper: MemoryRouter });

    result.current.goNext();

    expect(useStore.getState().currentStation).toBeNull();
  });
});
