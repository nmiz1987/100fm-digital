import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStationCard } from '../useStationCard';
import type { Station } from '../../../types';

const makeStation = (overrides: Partial<Station> = {}): Station => ({
  name: 'Rock FM',
  audio: 'http://stream/rock-fm',
  slug: 'rock-fm',
  logo: 'rock-fm-logo.png',
  ...overrides,
});

describe('useStationCard', () => {
  it('uses the cover image initially when one is set', () => {
    const station = makeStation({ cover: 'rock-cover.png' });
    const { result } = renderHook(() => useStationCard(station));
    expect(result.current.imgSrc).toBe('rock-cover.png');
  });

  it('falls back to the logo initially when no cover is set', () => {
    const station = makeStation({ cover: undefined });
    const { result } = renderHook(() => useStationCard(station));
    expect(result.current.imgSrc).toBe('rock-fm-logo.png');
  });

  it('allows updating the image source', () => {
    const station = makeStation({ cover: 'rock-cover.png' });
    const { result } = renderHook(() => useStationCard(station));

    act(() => {
      result.current.setImgSrc('rock-fm-logo.png');
    });

    expect(result.current.imgSrc).toBe('rock-fm-logo.png');
  });
});
