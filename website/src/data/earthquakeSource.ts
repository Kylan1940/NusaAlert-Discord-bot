import type { Earthquake } from '../types/earthquake';

/**
 * The only module that knows how earthquake records are loaded.
 * It reads them from the NusaAlert bot's API (`GET /api/earthquakes`).
 */

// Always use the same-origin endpoint. Vercel proxies it server-side in production,
// while Vite proxies it during local development. This avoids browser Mixed Content.
const API_ENDPOINT = '/api/earthquakes';

export const isSourceConfigured = true;

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Accepts a record only if its required fields are valid. Optional fields stay null. */
function parseRecord(value: unknown): Earthquake | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;

  const magnitude = numberOrNull(record.magnitude);
  if (
    typeof record.id !== 'string' ||
    typeof record.location !== 'string' ||
    typeof record.timestamp !== 'string' ||
    magnitude === null ||
    Number.isNaN(new Date(record.timestamp).getTime())
  ) {
    return null;
  }

  return {
    id: record.id,
    magnitude,
    location: record.location,
    timestamp: record.timestamp,
    depth: numberOrNull(record.depth),
    latitude: numberOrNull(record.latitude),
    longitude: numberOrNull(record.longitude),
    source: typeof record.source === 'string' && record.source !== '' ? record.source : null,
  };
}

export async function fetchEarthquakes(signal?: AbortSignal): Promise<Earthquake[]> {
  const response = await fetch(API_ENDPOINT, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);

  const body: unknown = await response.json();
  const list =
    typeof body === 'object' && body !== null
      ? (body as { earthquakes?: unknown }).earthquakes
      : undefined;
  if (!Array.isArray(list)) throw new Error('Unexpected response shape');

  return list.map(parseRecord).filter((item): item is Earthquake => item !== null);
}