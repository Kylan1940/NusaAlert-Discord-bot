import { useEffect, useState } from 'react';
import { fetchEarthquakes, isSourceConfigured } from '../data/earthquakeSource';
import type { DataStatus, Earthquake } from '../types/earthquake';

interface EarthquakesState {
  earthquakes: Earthquake[];
  status: DataStatus;
}

/**
 * Loads earthquake records and refreshes them periodically (the bot checks
 * BMKG every minute). A failed refresh keeps the records already on screen.
 */
export function useEarthquakes(refreshMs = 60_000): EarthquakesState {
  const [state, setState] = useState<EarthquakesState>({
    earthquakes: [],
    status: isSourceConfigured ? 'loading' : 'unavailable',
  });

  useEffect(() => {
    if (!isSourceConfigured) return;

    let cancelled = false;
    let controller: AbortController | null = null;

    async function load() {
      controller?.abort();
      controller = new AbortController();
      try {
        const earthquakes = await fetchEarthquakes(controller.signal);
        if (!cancelled) setState({ earthquakes, status: 'ready' });
      } catch (error) {
        if (cancelled || (error instanceof DOMException && error.name === 'AbortError')) return;
        setState((current) =>
          current.status === 'ready' ? current : { earthquakes: [], status: 'unavailable' },
        );
      }
    }

    void load();
    const timer = window.setInterval(() => void load(), refreshMs);
    return () => {
      cancelled = true;
      controller?.abort();
      window.clearInterval(timer);
    };
  }, [refreshMs]);

  return state;
}