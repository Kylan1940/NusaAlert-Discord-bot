/**
 * A single earthquake record.
 *
 * Only `id`, `magnitude`, `location` and `timestamp` are guaranteed.
 * Everything else may be unavailable and is represented explicitly as `null`
 * rather than a made-up value. The UI renders `null` as a dash.
 */
export interface Earthquake {
  id: string;
  /** Magnitude on the usual scale, e.g. 4.7 */
  magnitude: number;
  /** Human-readable location description */
  location: string;
  /** ISO 8601 timestamp (UTC) */
  timestamp: string;
  /** Depth in kilometres, or null when unavailable */
  depth: number | null;
  /** Decimal degrees, negative = south. Null when unavailable */
  latitude: number | null;
  /** Decimal degrees, negative = west. Null when unavailable */
  longitude: number | null;
  /** Where the record came from, or null when unknown */
  source: string | null;
}

export type MagnitudeLevelKey = 'minor' | 'light' | 'moderate' | 'strong';

export type MagnitudeRange = 'all' | MagnitudeLevelKey;

/** Time window used by the map. `today` is the current calendar day in WIB. */
export type TimeRange = 'all' | '7d' | '3d' | '1d' | 'today';

export type SortOption =
  | 'time-desc'
  | 'time-asc'
  | 'magnitude-desc'
  | 'magnitude-asc';

export interface HistoryFilters {
  /** Free-text search against the location */
  query: string;
  magnitude: MagnitudeRange;
  /** Inclusive start day, `YYYY-MM-DD` (WIB), or empty */
  dateFrom: string;
  /** Inclusive end day, `YYYY-MM-DD` (WIB), or empty */
  dateTo: string;
  sort: SortOption;
}

/** Overall state of the data source, used by the dashboard to pick a view. */
export type DataStatus = 'ready' | 'loading' | 'unavailable';