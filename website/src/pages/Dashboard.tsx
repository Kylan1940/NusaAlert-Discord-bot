import { CalendarDays, Clock, Database, Gauge } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EarthquakeFilters } from '../components/EarthquakeFilters';
import { EarthquakeHistoryTable } from '../components/EarthquakeHistoryTable';
import { EarthquakeMapPanel } from '../components/EarthquakeMapPanel';
import { EmptyState } from '../components/EmptyState';
import { Hero } from '../components/Hero';
import { LatestEarthquakeCard } from '../components/LatestEarthquakeCard';
import { LoadingState } from '../components/LoadingState';
import { Navbar } from '../components/Navbar';
import { StatCard } from '../components/StatCard';
import type { DataStatus, Earthquake, HistoryFilters, TimeRange } from '../types/earthquake';
import {
  DASH,
  DEFAULT_FILTERS,
  TIME_RANGES,
  applyHistoryFilters,
  computeStats,
  filterByTimeRange,
  formatMagnitude,
  formatRelativeTime,
  formatTimeOfDay,
} from '../utils/earthquakeUtils';

const PAGE_SIZE = 6;

interface DashboardProps {
  /** Earthquake records. Supplied by the data source, never imported here. */
  earthquakes: readonly Earthquake[];
  status?: DataStatus;
}

export function Dashboard({ earthquakes, status = 'ready' }: DashboardProps) {
  // Keeps "12 minutes ago" and the time-range counts correct while the page stays open.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_FILTERS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // The map's time range also drives the "Events ..." statistic card.
  const [mapRange, setMapRange] = useState<TimeRange>('7d');

  const isReady = status === 'ready';

  const stats = useMemo(() => computeStats(earthquakes, now), [earthquakes, now]);
  const eventsInRange = useMemo(
    () => filterByTimeRange(earthquakes, mapRange, now).length,
    [earthquakes, mapRange, now],
  );
  const eventsLabel =
    TIME_RANGES.find((item) => item.key === mapRange)?.eventsLabel ?? 'Events';
  const filtered = useMemo(
    () => applyHistoryFilters(earthquakes, filters),
    [earthquakes, filters],
  );
  const visible = filtered.slice(0, visibleCount);
  const latest = stats.latest;

  function updateFilters(changes: Partial<HistoryFilters>) {
    setFilters((current) => ({ ...current, ...changes }));
    setVisibleCount(PAGE_SIZE);
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setVisibleCount(PAGE_SIZE);
  }

  const hasData = isReady && earthquakes.length > 0;

  return (
    <>
      <Navbar />

      <main className="container main">
        <section id="overview" className="section" aria-labelledby="page-title">
          <Hero />

          <div className="overview-grid">
            <div className="area-latest">
              <LatestEarthquakeCard earthquake={latest} now={now} status={status} />
            </div>

            <div className="area-stats stats-grid">
              <StatCard
                icon={<Database size={18} />}
                label="Total Recorded Events"
                value={hasData ? String(stats.total) : DASH}
              />
              <StatCard
                icon={<CalendarDays size={18} />}
                label={eventsLabel}
                value={hasData ? String(eventsInRange) : DASH}
              />
              <StatCard
                icon={<Gauge size={18} />}
                label="Strongest Magnitude"
                value={stats.strongest && isReady ? `M ${formatMagnitude(stats.strongest.magnitude)}` : DASH}
                hint={stats.strongest && isReady ? stats.strongest.location : undefined}
              />
              <StatCard
                icon={<Clock size={18} />}
                label="Last Event Time"
                value={latest && isReady ? formatTimeOfDay(latest.timestamp) : DASH}
                hint={latest && isReady ? formatRelativeTime(latest.timestamp, now) : undefined}
              />
            </div>

            <div className="area-map">
              <EarthquakeMapPanel
                earthquakes={isReady ? earthquakes : []}
                now={now}
                range={mapRange}
                onRangeChange={setMapRange}
                latestId={latest?.id ?? null}
              />
            </div>
          </div>
        </section>

        <section id="history" className="section card history" aria-labelledby="history-title">
          <header className="card__header">
            <h2 id="history-title" className="card__title">
              Earthquake History
            </h2>
            {hasData ? (
              <span className="card__meta">
                {earthquakes.length} {earthquakes.length === 1 ? 'record' : 'records'}
              </span>
            ) : null}
          </header>

          {status === 'loading' ? (
            <LoadingState variant="table" />
          ) : status === 'unavailable' ? (
            <EmptyState variant="unavailable" />
          ) : earthquakes.length === 0 ? (
            <EmptyState variant="no-history" />
          ) : (
            <>
              <EarthquakeFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />
              {filtered.length === 0 ? (
                <EmptyState
                  variant="no-results"
                  actionLabel="Reset filters"
                  onAction={resetFilters}
                />
              ) : (
                <EarthquakeHistoryTable
                  earthquakes={visible}
                  totalMatching={filtered.length}
                  latestId={latest?.id ?? null}
                  onLoadMore={() => setVisibleCount((count) => count + PAGE_SIZE)}
                />
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}