import type {
  Earthquake,
  HistoryFilters,
  MagnitudeLevelKey,
  SortOption,
} from '../types/earthquake';

/** Shown wherever a value is not available. */
export const DASH = '—';

export const TIME_ZONE = 'Asia/Jakarta';
export const TIME_ZONE_LABEL = 'WIB';

export const DEFAULT_FILTERS: HistoryFilters = {
  query: '',
  magnitude: 'all',
  dateFrom: '',
  dateTo: '',
  sort: 'time-desc',
};

/* -------------------------------------------------------------------------- */
/* Magnitude levels                                                            */
/* -------------------------------------------------------------------------- */

export interface MagnitudeLevel {
  key: MagnitudeLevelKey;
  label: string;
  rangeLabel: string;
  /** Inclusive lower bound */
  min: number;
  /** Exclusive upper bound */
  max: number;
}

export const MAGNITUDE_LEVELS: readonly MagnitudeLevel[] = [
  { key: 'minor', label: 'Minor', rangeLabel: '< 4.0', min: 0, max: 4 },
  { key: 'light', label: 'Light', rangeLabel: '4.0 – 4.9', min: 4, max: 5 },
  { key: 'moderate', label: 'Moderate', rangeLabel: '5.0 – 5.9', min: 5, max: 6 },
  { key: 'strong', label: 'Strong', rangeLabel: '≥ 6.0', min: 6, max: Infinity },
];

export function getMagnitudeLevel(magnitude: number): MagnitudeLevel {
  return (
    MAGNITUDE_LEVELS.find((l) => magnitude >= l.min && magnitude < l.max) ??
    MAGNITUDE_LEVELS[0]
  );
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                  */
/* -------------------------------------------------------------------------- */

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: TIME_ZONE,
});

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: TIME_ZONE,
});

function parseDate(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatMagnitude(magnitude: number): string {
  return magnitude.toFixed(1);
}

/** e.g. "21 Okt 2026 · 10:15 WIB" */
export function formatDateTime(iso: string): string {
  const date = parseDate(iso);
  if (!date) return DASH;
  return `${dateFormatter.format(date)} · ${timeFormatter.format(date)} ${TIME_ZONE_LABEL}`;
}

/** e.g. "10:15 WIB" */
export function formatTimeOfDay(iso: string): string {
  const date = parseDate(iso);
  if (!date) return DASH;
  return `${timeFormatter.format(date)} ${TIME_ZONE_LABEL}`;
}

export function formatDepth(depth: number | null): string {
  if (depth === null) return DASH;
  return `${Number.isInteger(depth) ? depth : depth.toFixed(1)} km`;
}

/** e.g. "8.55° S, 110.80° E". Dash unless both values are present. */
export function formatCoordinates(
  latitude: number | null,
  longitude: number | null,
): string {
  if (latitude === null || longitude === null) return DASH;
  const lat = `${Math.abs(latitude).toFixed(2)}° ${latitude < 0 ? 'S' : 'N'}`;
  const lon = `${Math.abs(longitude).toFixed(2)}° ${longitude < 0 ? 'W' : 'E'}`;
  return `${lat}, ${lon}`;
}

export function formatSource(source: string | null): string {
  return source && source.trim() ? source : DASH;
}

function plural(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
}

/** e.g. "12 minutes ago" */
export function formatRelativeTime(iso: string, now: number): string {
  const date = parseDate(iso);
  if (!date) return DASH;
  const seconds = Math.floor((now - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return plural(minutes, 'minute');
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return plural(hours, 'hour');
  return plural(Math.floor(hours / 24), 'day');
}

/** Calendar day in WIB as `YYYY-MM-DD`, or null for an invalid timestamp. */
export function toDayKey(iso: string | number): string | null {
  const date = typeof iso === 'number' ? new Date(iso) : parseDate(iso);
  if (!date || Number.isNaN(date.getTime())) return null;
  return dayKeyFormatter.format(date);
}

/* -------------------------------------------------------------------------- */
/* Derived data                                                                */
/* -------------------------------------------------------------------------- */

export function getLatestEarthquake(
  earthquakes: readonly Earthquake[],
): Earthquake | null {
  let latest: Earthquake | null = null;
  for (const eq of earthquakes) {
    if (parseDate(eq.timestamp) === null) continue;
    if (latest === null || eq.timestamp > latest.timestamp) latest = eq;
  }
  return latest;
}

export interface EarthquakeStats {
  total: number;
  today: number;
  strongest: Earthquake | null;
  latest: Earthquake | null;
}

export function computeStats(
  earthquakes: readonly Earthquake[],
  now: number,
): EarthquakeStats {
  const todayKey = toDayKey(now);
  let strongest: Earthquake | null = null;
  let today = 0;
  for (const eq of earthquakes) {
    if (strongest === null || eq.magnitude > strongest.magnitude) strongest = eq;
    if (todayKey !== null && toDayKey(eq.timestamp) === todayKey) today += 1;
  }
  return {
    total: earthquakes.length,
    today,
    strongest,
    latest: getLatestEarthquake(earthquakes),
  };
}

/* -------------------------------------------------------------------------- */
/* Filtering and sorting                                                       */
/* -------------------------------------------------------------------------- */

export function isDefaultFilters(filters: HistoryFilters): boolean {
  return (
    filters.query === DEFAULT_FILTERS.query &&
    filters.magnitude === DEFAULT_FILTERS.magnitude &&
    filters.dateFrom === DEFAULT_FILTERS.dateFrom &&
    filters.dateTo === DEFAULT_FILTERS.dateTo &&
    filters.sort === DEFAULT_FILTERS.sort
  );
}

export function sortEarthquakes(
  earthquakes: readonly Earthquake[],
  sort: SortOption,
): Earthquake[] {
  const byTimeDesc = (a: Earthquake, b: Earthquake) =>
    a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0;

  const comparators: Record<SortOption, (a: Earthquake, b: Earthquake) => number> = {
    'time-desc': byTimeDesc,
    'time-asc': (a, b) => -byTimeDesc(a, b),
    'magnitude-desc': (a, b) => b.magnitude - a.magnitude || byTimeDesc(a, b),
    'magnitude-asc': (a, b) => a.magnitude - b.magnitude || byTimeDesc(a, b),
  };

  return [...earthquakes].sort(comparators[sort]);
}

/** Applies search, magnitude range, date range and sorting together. */
export function applyHistoryFilters(
  earthquakes: readonly Earthquake[],
  filters: HistoryFilters,
): Earthquake[] {
  const query = filters.query.trim().toLowerCase();
  const level =
    filters.magnitude === 'all'
      ? null
      : (MAGNITUDE_LEVELS.find((l) => l.key === filters.magnitude) ?? null);
  const hasDateFilter = filters.dateFrom !== '' || filters.dateTo !== '';

  const matches = earthquakes.filter((eq) => {
    if (query && !eq.location.toLowerCase().includes(query)) return false;
    if (level && !(eq.magnitude >= level.min && eq.magnitude < level.max)) {
      return false;
    }
    if (hasDateFilter) {
      const day = toDayKey(eq.timestamp);
      if (day === null) return false;
      if (filters.dateFrom && day < filters.dateFrom) return false;
      if (filters.dateTo && day > filters.dateTo) return false;
    }
    return true;
  });

  return sortEarthquakes(matches, filters.sort);
}
