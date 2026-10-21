import { RotateCcw, Search } from 'lucide-react';
import type { HistoryFilters, MagnitudeRange, SortOption } from '../types/earthquake';
import { MAGNITUDE_LEVELS, isDefaultFilters } from '../utils/earthquakeUtils';

interface EarthquakeFiltersProps {
  filters: HistoryFilters;
  onChange: (changes: Partial<HistoryFilters>) => void;
  onReset: () => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'time-desc', label: 'Newest first' },
  { value: 'time-asc', label: 'Oldest first' },
  { value: 'magnitude-desc', label: 'Strongest first' },
  { value: 'magnitude-asc', label: 'Weakest first' },
];

export function EarthquakeFilters({ filters, onChange, onReset }: EarthquakeFiltersProps) {
  return (
    <form
      className="filters"
      role="search"
      aria-label="Filter earthquake history"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="field field--search">
        <label htmlFor="filter-query">Search location</label>
        <div className="input-with-icon">
          <Search size={16} aria-hidden="true" />
          <input
            id="filter-query"
            type="search"
            placeholder="e.g. Maluku, Pacitan"
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="filter-magnitude">Magnitude</label>
        <select
          id="filter-magnitude"
          value={filters.magnitude}
          onChange={(event) => onChange({ magnitude: event.target.value as MagnitudeRange })}
        >
          <option value="all">All magnitudes</option>
          {MAGNITUDE_LEVELS.map((level) => (
            <option key={level.key} value={level.key}>
              {level.label} ({level.rangeLabel})
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="filter-from">From date</label>
        <input
          id="filter-from"
          type="date"
          value={filters.dateFrom}
          max={filters.dateTo || undefined}
          onChange={(event) => onChange({ dateFrom: event.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="filter-to">To date</label>
        <input
          id="filter-to"
          type="date"
          value={filters.dateTo}
          min={filters.dateFrom || undefined}
          onChange={(event) => onChange({ dateTo: event.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="filter-sort">Sort by</label>
        <select
          id="filter-sort"
          value={filters.sort}
          onChange={(event) => onChange({ sort: event.target.value as SortOption })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="button button--secondary filters__reset"
        onClick={onReset}
        disabled={isDefaultFilters(filters)}
      >
        <RotateCcw size={15} aria-hidden="true" />
        Reset
      </button>
    </form>
  );
}
