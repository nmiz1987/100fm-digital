import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCarStationImage } from '../useCarStationImage';
import { Station } from '../../../../types';

const makeStation = (overrides: Partial<Station> = {}): Station => ({
  name: 'Rock FM',
  audio: 'http://stream/rock-fm',
  slug: 'rock-fm',
  logo: 'rock-fm-logo.png',
  ...overrides,
});

describe('useCarStationImage', () => {
  it('uses the cover image initially when one is set', () => {
    const station = makeStation({ cover: 'rock-cover.png' });
    const { result } = renderHook(() => useCarStationImage(station));

    expect(result.current.imgSrc).toBe('rock-cover.png');
  });

  it('falls back to the logo initially when no cover is set', () => {
    const station = makeStation({ cover: undefined });
    const { result } = renderHook(() => useCarStationImage(station));

    expect(result.current.imgSrc).toBe('rock-fm-logo.png');
  });

  it('falls back to the logo on error when a cover image fails to load', () => {
    const station = makeStation({ cover: 'rock-cover.png' });
    const { result } = renderHook(() => useCarStationImage(station));

    act(() => {
      result.current.onError();
    });

    expect(result.current.imgSrc).toBe('rock-fm-logo.png');
  });

  it('does nothing on error when there is no cover and the logo already failed', () => {
    const station = makeStation({ cover: undefined });
    const { result } = renderHook(() => useCarStationImage(station));

    act(() => {
      result.current.onError();
    });

    expect(result.current.imgSrc).toBe('rock-fm-logo.png');
  });
});
