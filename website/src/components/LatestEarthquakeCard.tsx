import { Clock } from 'lucide-react';
import type { DataStatus, Earthquake } from '../types/earthquake';
import {
  MAGNITUDE_LEVELS,
  formatCoordinates,
  formatDateTime,
  formatDepth,
  formatMagnitude,
  formatRelativeTime,
  getMagnitudeLevel,
} from '../utils/earthquakeUtils';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';

interface LatestEarthquakeCardProps {
  earthquake: Earthquake | null;
  /** Reference time (ms) used for the relative timestamp */
  now: number;
  status?: DataStatus;
}

export function LatestEarthquakeCard({
  earthquake,
  now,
  status = 'ready',
}: LatestEarthquakeCardProps) {
  const showEvent = status === 'ready' && earthquake !== null;

  return (
    <article
      className={`card latest-card${showEvent ? ' latest-card--feature' : ''}`}
      aria-labelledby="latest-title"
    >
      <header className="card__header">
        <h2 id="latest-title" className="card__title">
          Latest Earthquake
        </h2>
      </header>

      {status === 'loading' ? (
        <LoadingState variant="card" />
      ) : status === 'unavailable' ? (
        <EmptyState variant="unavailable" compact />
      ) : earthquake === null ? (
        <EmptyState variant="no-history" compact />
      ) : (
        <LatestBody earthquake={earthquake} now={now} />
      )}
    </article>
  );
}

function LatestBody({ earthquake, now }: { earthquake: Earthquake; now: number }) {
  const level = getMagnitudeLevel(earthquake.magnitude);
  const levelIndex = MAGNITUDE_LEVELS.findIndex((l) => l.key === level.key);

  return (
    <div className={`latest-card__body mag--${level.key}`}>
      <div className="latest-card__primary">
        <p
          className="latest-card__magnitude"
          aria-label={`Magnitude ${formatMagnitude(earthquake.magnitude)}`}
        >
          <span className="latest-card__magnitude-prefix">M</span>
          {formatMagnitude(earthquake.magnitude)}
        </p>
        <div className="latest-card__headline">
          <p className="latest-card__location">{earthquake.location}</p>
          <p className="latest-card__relative">
            <Clock size={14} aria-hidden="true" />
            {formatRelativeTime(earthquake.timestamp, now)}
          </p>
        </div>
      </div>

      <div className="severity">
        <div className="severity__segments" aria-hidden="true">
          {MAGNITUDE_LEVELS.map((l, i) => (
            <span key={l.key} className={i <= levelIndex ? 'is-on' : undefined} />
          ))}
        </div>
        <span className="severity__label">
          <span className="severity__dot" aria-hidden="true" />
          <span>
            {level.label} <span className="severity__range">({level.rangeLabel})</span>
          </span>
        </span>
      </div>

      <dl className="meta-grid">
        <div className="meta-grid__item meta-grid__item--wide">
          <dt>Date &amp; Time</dt>
          <dd>{formatDateTime(earthquake.timestamp)}</dd>
        </div>
        <div className="meta-grid__item">
          <dt>Depth</dt>
          <dd>{formatDepth(earthquake.depth)}</dd>
        </div>
        <div className="meta-grid__item">
          <dt>Coordinates</dt>
          <dd>{formatCoordinates(earthquake.latitude, earthquake.longitude)}</dd>
        </div>
      </dl>
    </div>
  );
}