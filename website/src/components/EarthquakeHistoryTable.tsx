import { ChevronDown } from 'lucide-react';
import type { Earthquake } from '../types/earthquake';
import {
  formatCoordinates,
  formatDateTime,
  formatDepth,
  formatSource,
} from '../utils/earthquakeUtils';
import { MagnitudeBadge } from './MagnitudeBadge';

interface EarthquakeHistoryTableProps {
  /** The rows to display (already filtered, sorted and paginated) */
  earthquakes: readonly Earthquake[];
  /** Total number of rows matching the current filters */
  totalMatching: number;
  /** Row to highlight as the latest event */
  latestId?: string | null;
  onLoadMore?: () => void;
}

export function EarthquakeHistoryTable({
  earthquakes,
  totalMatching,
  latestId = null,
  onLoadMore,
}: EarthquakeHistoryTableProps) {
  const hasMore = earthquakes.length < totalMatching;

  return (
    <div className="table-section">
      <div className="table-scroll" tabIndex={0} role="region" aria-label="Earthquake history table">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Magnitude</th>
              <th scope="col">Location</th>
              <th scope="col">Date &amp; Time</th>
              <th scope="col">Depth</th>
              <th scope="col">Coordinates</th>
              <th scope="col">Source</th>
            </tr>
          </thead>
          <tbody>
            {earthquakes.map((eq) => (
              <tr key={eq.id} className={eq.id === latestId ? 'is-latest' : undefined}>
                <td>
                  <MagnitudeBadge magnitude={eq.magnitude} />
                </td>
                <td className="data-table__location">
                  {eq.location}
                  {eq.id === latestId ? <span className="chip chip--accent chip--xs">Latest</span> : null}
                </td>
                <td className="data-table__nowrap">{formatDateTime(eq.timestamp)}</td>
                <td className="data-table__nowrap data-table__num">{formatDepth(eq.depth)}</td>
                <td className="data-table__nowrap data-table__num">
                  {formatCoordinates(eq.latitude, eq.longitude)}
                </td>
                <td className="data-table__nowrap">{formatSource(eq.source)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p className="table-footer__count" aria-live="polite">
          Showing {earthquakes.length} of {totalMatching}{' '}
          {totalMatching === 1 ? 'record' : 'records'}
        </p>
        {hasMore && onLoadMore ? (
          <button type="button" className="button button--primary" onClick={onLoadMore}>
            Load more
            <ChevronDown size={15} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
