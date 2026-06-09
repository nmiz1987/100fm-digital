import { useState, useEffect } from 'react';
import type { Station } from '../types';
import { fetchNowPlayingJson } from '../utils/proxyUrl';

const POLL_INTERVAL = 30_000;

function buildLabel(data: { artist?: string; name?: string } | null, fallback: string): string {
  const artist = data?.artist?.trim();
  const name = data?.name?.trim();
  if (artist && name) return `${artist} — ${name}`;
  if (artist) return artist;
  if (name) return name;
  return fallback;
}

// Returns labels where index 0 is the live station label and indices 1+ are DVR slider labels.
export function useSliderLabels(station: Station | undefined): string[] {
  const [labels, setLabels] = useState<string[]>([]);

  const sliders = station?.sliders;
  const stationName = station?.name ?? '';
  // Stable key so the effect only re-runs when the station info or slider set changes
  const infoKey = [station?.info ?? '', ...(sliders?.map((s) => s.info ?? '') ?? [])].join('|');

  useEffect(() => {
    if (!station || !sliders || sliders.length === 0) return;

    let cancelled = false;

    async function refresh() {
      if (!station || !sliders) return;
      const liveLabel = station.info
        ? fetchNowPlayingJson(station.info).then((data) => buildLabel(data, `${stationName} #1`))
        : Promise.resolve(`${stationName} #1`);

      const sliderResults = sliders.map((slider, i) =>
        slider.info
          ? fetchNowPlayingJson(slider.info).then((data) =>
              buildLabel(data, `${stationName} #${i + 2}`)
            )
          : Promise.resolve(`${stationName} #${i + 2}`)
      );

      const results = await Promise.all([liveLabel, ...sliderResults]);
      if (!cancelled) setLabels(results);
    }

    void refresh();
    const id = setInterval(() => void refresh(), POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoKey, stationName]);

  return station && sliders && sliders.length > 0 ? labels : [];
}
