import {
  APIProvider,
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  Map as GoogleMap,
  useMap,
} from '@vis.gl/react-google-maps';
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Earthquake } from '../types/earthquake';
import {
  MAGNITUDE_LEVELS,
  formatCoordinates,
  formatDateTime,
  formatDepth,
  formatMagnitude,
  getMagnitudeLevel,
} from '../utils/earthquakeUtils';
import { EmptyState } from './EmptyState';
import { MagnitudeBadge } from './MagnitudeBadge';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? '';
// DEMO_MAP_ID is provided by Google for development. Set VITE_GOOGLE_MAP_ID
// to use your own Cloud Map ID.
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID?.trim() || 'DEMO_MAP_ID';

const INDONESIA_CENTER = { lat: -2.5, lng: 118 };
const DEFAULT_ZOOM = 4;

declare global {
  interface Window {
    /** Google Maps calls this when the API key is rejected. */
    gm_authFailure?: () => void;
  }
}

interface EarthquakeMapPanelProps {
  earthquakes: readonly Earthquake[];
  /** Id of the latest event, which gets an extra ring */
  latestId?: string | null;
}

type PlottedEarthquake = Earthquake & { latitude: number; longitude: number };

function hasCoordinates(eq: Earthquake): eq is PlottedEarthquake {
  return eq.latitude !== null && eq.longitude !== null;
}

/** Marker diameter in px, growing with magnitude. */
function markerSize(magnitude: number): number {
  return Math.round(14 + Math.max(0, magnitude - 2.5) * 6);
}

/** Re-frames the map on request. Lives inside <GoogleMap> to reach the map. */
function ViewController({
  points,
  fitSignal,
}: {
  points: readonly { lat: number; lng: number }[];
  fitSignal: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || fitSignal === 0) return;
    if (points.length === 0) {
      map.setCenter(INDONESIA_CENTER);
      map.setZoom(DEFAULT_ZOOM);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    points.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, 48);
  }, [map, points, fitSignal]);

  return null;
}

/**
 * Earthquake map backed by the Google Maps JavaScript API.
 *
 * It only needs `earthquakes` (and optionally `latestId`) as props, so it can
 * be swapped for another map implementation without touching the dashboard.
 */
export function EarthquakeMapPanel({ earthquakes, latestId = null }: EarthquakeMapPanelProps) {
  const [showLabels, setShowLabels] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fitSignal, setFitSignal] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);

  // Google calls this global when the key is invalid or the referrer is blocked.
  useEffect(() => {
    window.gm_authFailure = () => setLoadFailed(true);
    return () => {
      delete window.gm_authFailure;
    };
  }, []);

  const plotted = useMemo(() => earthquakes.filter(hasCoordinates), [earthquakes]);
  const points = useMemo(
    () => plotted.map((eq) => ({ lat: eq.latitude, lng: eq.longitude })),
    [plotted],
  );
  const unplotted = earthquakes.length - plotted.length;
  const selected = earthquakes.find((eq) => eq.id === selectedId) ?? null;

  const hasKey = API_KEY !== '';
  const mapAvailable = hasKey && !loadFailed;

  function toggleSelected(id: string) {
    setSelectedId((current) => (current === id ? null : id));
  }

  return (
    <section className="card map-panel" aria-labelledby="map-title">
      <header className="card__header">
        <h2 id="map-title" className="card__title">
          Earthquake Map
        </h2>
        <div className="map-controls" role="group" aria-label="Map options">
          <button
            type="button"
            className="toggle"
            aria-pressed={showLabels}
            disabled={!mapAvailable}
            onClick={() => setShowLabels((v) => !v)}
          >
            Labels
          </button>
          <button
            type="button"
            className="toggle"
            disabled={!mapAvailable}
            onClick={() => setFitSignal((n) => n + 1)}
          >
            Fit all
          </button>
        </div>
      </header>

      <div className="map-canvas">
        {!hasKey ? (
          <EmptyState variant="map-no-key" />
        ) : loadFailed ? (
          <EmptyState variant="map-error" />
        ) : (
          <APIProvider apiKey={API_KEY} onError={() => setLoadFailed(true)}>
            <div className="map-canvas__map">
              <GoogleMap
                mapId={MAP_ID}
                defaultCenter={INDONESIA_CENTER}
                defaultZoom={DEFAULT_ZOOM}
                gestureHandling="cooperative"
                clickableIcons={false}
                streetViewControl={false}
                mapTypeControl={false}
                fullscreenControl={false}
                onClick={() => setSelectedId(null)}
              >
                {plotted.map((eq) => {
                  const level = getMagnitudeLevel(eq.magnitude);
                  const isSelected = eq.id === selectedId;
                  const isLatest = eq.id === latestId;
                  const style = { '--size': `${markerSize(eq.magnitude)}px` } as CSSProperties;
                  return (
                    <AdvancedMarker
                      key={eq.id}
                      position={{ lat: eq.latitude, lng: eq.longitude }}
                      title={`M ${formatMagnitude(eq.magnitude)} · ${eq.location}`}
                      // Bigger quakes sit lower so small ones stay clickable on top.
                      zIndex={isSelected ? 10_000 : 1000 - Math.round(eq.magnitude * 10)}
                      anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
                      onClick={() => toggleSelected(eq.id)}
                    >
                      <div
                        className={`gm-marker mag--${level.key}${isSelected ? ' is-selected' : ''}${isLatest ? ' is-latest' : ''}`}
                        style={style}
                      >
                        {showLabels ? (
                          <span className="gm-marker__label">{formatMagnitude(eq.magnitude)}</span>
                        ) : null}
                      </div>
                    </AdvancedMarker>
                  );
                })}
                <ViewController points={points} fitSignal={fitSignal} />
              </GoogleMap>
            </div>
          </APIProvider>
        )}
      </div>

      <div className="map-detail" aria-live="polite">
        {selected ? (
          <>
            <MagnitudeBadge magnitude={selected.magnitude} size="sm" />
            <div className="map-detail__text">
              <p className="map-detail__title">{selected.location}</p>
              <p className="map-detail__meta">
                {formatDateTime(selected.timestamp)} · {formatDepth(selected.depth)} ·{' '}
                {formatCoordinates(selected.latitude, selected.longitude)}
              </p>
            </div>
          </>
        ) : (
          <p className="map-detail__hint">Select a marker to see its details.</p>
        )}
      </div>

      <footer className="map-footer">
        <ul className="legend" aria-label="Magnitude legend">
          {MAGNITUDE_LEVELS.map((level) => (
            <li key={level.key} className={`legend__item mag--${level.key}`}>
              <span className="legend__dot" aria-hidden="true" />
              <span className="legend__label">{level.label}</span>
              <span className="legend__range">{level.rangeLabel}</span>
            </li>
          ))}
        </ul>
        <p className="map-footer__note">
          Marker size scales with magnitude.
          {unplotted > 0
            ? ` ${unplotted} ${unplotted === 1 ? 'event has' : 'events have'} no coordinates and ${unplotted === 1 ? 'is' : 'are'} not shown.`
            : ''}
        </p>
      </footer>
    </section>
  );
}
