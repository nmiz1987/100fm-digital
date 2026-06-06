import { useState, useEffect } from 'react';
import type { Station } from '../types';

interface ApiResponse {
  stations?: Station[];
  [key: string]: unknown;
}

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStations() {
      try {
        const res = await fetch('https://digital.100fm.co.il/app/', { signal: controller.signal });
        console.log('fetchStations response:', res);
        const data = (await res.json()) as ApiResponse;
        console.log('fetchStations data:', data);
        const list = Array.isArray(data.stations) ? data.stations : [];
        setStations(list.filter((s) => s.slug && s.audio));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stations:', err);
        if ((err as Error).name !== 'AbortError') {
          setError('לא ניתן לטעון את רשימת התחנות');
          setLoading(false);
        }
        // AbortError: effect was cleaned up (React StrictMode), keep loading=true
      }
    }

    void fetchStations();
    return () => controller.abort();
  }, []);

  return { stations, loading, error };
}
