import type { Station, Slider, NowPlaying } from '../../types';

interface UsePlayerBarParams {
  station: Station | null;
  currentSlider: Slider | null;
  nowPlaying: NowPlaying | null;
}

export function usePlayerBar({ station, currentSlider, nowPlaying }: UsePlayerBarParams) {
  const hasSliders = (station?.sliders?.length ?? 0) > 0;
  const trackLine =
    nowPlaying?.artist && nowPlaying?.name
      ? `${nowPlaying.artist} — ${nowPlaying.name}`
      : nowPlaying?.name || null;

  const currentSliderIndex = station?.sliders?.indexOf(currentSlider!) ?? -1;

  return { hasSliders, trackLine, currentSliderIndex };
}
