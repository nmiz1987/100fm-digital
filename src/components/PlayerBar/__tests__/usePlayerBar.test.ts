import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePlayerBar } from '../usePlayerBar';
import type { Station, Slider, NowPlaying } from '../../../types';

const slider1: Slider = { audio: 'http://slider1' };
const slider2: Slider = { audio: 'http://slider2' };

const station: Station = {
  name: 'Rock FM',
  audio: 'http://stream',
  slug: 'rock-fm',
  logo: 'logo.png',
};

const stationWithSliders: Station = { ...station, sliders: [slider1, slider2] };

const nowPlaying = (overrides: Partial<NowPlaying> = {}): NowPlaying => ({
  artist: 'Radiohead',
  name: 'Creep',
  timestamp: 0,
  before: 0,
  ...overrides,
});

describe('usePlayerBar', () => {
  it('hasSliders is false when the station has no sliders', () => {
    const { result } = renderHook(() => usePlayerBar({ station, currentSlider: null, nowPlaying: null }));
    expect(result.current.hasSliders).toBe(false);
  });

  it('hasSliders is true when the station has sliders', () => {
    const { result } = renderHook(() => usePlayerBar({ station: stationWithSliders, currentSlider: null, nowPlaying: null }));
    expect(result.current.hasSliders).toBe(true);
  });

  it('hasSliders is false when there is no station', () => {
    const { result } = renderHook(() => usePlayerBar({ station: null, currentSlider: null, nowPlaying: null }));
    expect(result.current.hasSliders).toBe(false);
  });

  it('trackLine combines artist and name', () => {
    const { result } = renderHook(() => usePlayerBar({ station, currentSlider: null, nowPlaying: nowPlaying() }));
    expect(result.current.trackLine).toBe('Radiohead — Creep');
  });

  it('trackLine falls back to name when artist is empty', () => {
    const { result } = renderHook(() => usePlayerBar({ station, currentSlider: null, nowPlaying: nowPlaying({ artist: '' }) }));
    expect(result.current.trackLine).toBe('Creep');
  });

  it('trackLine is null when nowPlaying is null', () => {
    const { result } = renderHook(() => usePlayerBar({ station, currentSlider: null, nowPlaying: null }));
    expect(result.current.trackLine).toBeNull();
  });

  it('trackLine is null when name is empty', () => {
    const { result } = renderHook(() => usePlayerBar({ station, currentSlider: null, nowPlaying: nowPlaying({ name: '' }) }));
    expect(result.current.trackLine).toBeNull();
  });

  it('currentSliderIndex is -1 when there is no current slider', () => {
    const { result } = renderHook(() => usePlayerBar({ station: stationWithSliders, currentSlider: null, nowPlaying: null }));
    expect(result.current.currentSliderIndex).toBe(-1);
  });

  it('currentSliderIndex finds the index of the current slider', () => {
    const { result } = renderHook(() => usePlayerBar({ station: stationWithSliders, currentSlider: slider2, nowPlaying: null }));
    expect(result.current.currentSliderIndex).toBe(1);
  });

  it('currentSliderIndex is -1 when there is no station', () => {
    const { result } = renderHook(() => usePlayerBar({ station: null, currentSlider: slider1, nowPlaying: null }));
    expect(result.current.currentSliderIndex).toBe(-1);
  });
});
