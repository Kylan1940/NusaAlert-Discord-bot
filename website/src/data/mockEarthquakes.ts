import type { Earthquake } from '../types/earthquake';

/**
 * Sample earthquake records for local development.
 *
 * Timestamps are generated relative to "now" so the relative-time labels and
 * the "Events Today" statistic stay meaningful whenever the page is opened.
 *
 * A few fields are intentionally `null` (depth, coordinates, source) to show
 * how the UI handles missing information.
 *
 * To connect a real data source later, replace `getMockEarthquakes` with a
 * function that returns `Earthquake[]` from that source. The UI components
 * only depend on the `Earthquake` type.
 */

const SOURCE = 'Discord Bot';

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export function getMockEarthquakes(): Earthquake[] {
  return [
    {
      id: 'eq-001',
      magnitude: 4.7,
      location: '48 km Barat Daya Pacitan, Jawa Timur',
      timestamp: minutesAgo(12),
      depth: 10,
      latitude: -8.55,
      longitude: 110.8,
      source: SOURCE,
    },
    {
      id: 'eq-002',
      magnitude: 3.8,
      location: 'Mamuju Tengah, Sulawesi Barat',
      timestamp: minutesAgo(95),
      depth: 8,
      latitude: -2.55,
      longitude: 119.0,
      source: SOURCE,
    },
    {
      id: 'eq-003',
      magnitude: 5.3,
      location: 'Kepulauan Tanimbar, Maluku',
      timestamp: minutesAgo(310),
      depth: 96,
      latitude: -7.15,
      longitude: 131.4,
      source: SOURCE,
    },
    {
      id: 'eq-004',
      magnitude: 4.2,
      location: 'Bengkulu Selatan, Bengkulu',
      timestamp: minutesAgo(780),
      depth: 28,
      latitude: -4.9,
      longitude: 102.45,
      source: SOURCE,
    },
    {
      id: 'eq-005',
      magnitude: 3.4,
      location: 'Jayapura, Papua',
      timestamp: minutesAgo(1500),
      depth: 15,
      latitude: -2.75,
      longitude: 140.6,
      source: SOURCE,
    },
    {
      id: 'eq-006',
      magnitude: 6.1,
      location: 'Kepulauan Talaud, Sulawesi Utara',
      timestamp: minutesAgo(2100),
      depth: 54,
      latitude: 3.95,
      longitude: 126.9,
      source: SOURCE,
    },
    {
      id: 'eq-007',
      magnitude: 4.0,
      location: 'Sumba Barat Daya, Nusa Tenggara Timur',
      timestamp: minutesAgo(2900),
      depth: 33,
      latitude: -9.6,
      longitude: 119.3,
      source: SOURCE,
    },
    {
      id: 'eq-008',
      magnitude: 5.0,
      location: 'Kepulauan Mentawai, Sumatera Barat',
      timestamp: minutesAgo(4300),
      depth: 22,
      latitude: -2.95,
      longitude: 99.6,
      source: SOURCE,
    },
    {
      id: 'eq-009',
      magnitude: 3.6,
      location: 'Banda Aceh, Aceh',
      timestamp: minutesAgo(5800),
      depth: null, // depth not reported
      latitude: 5.55,
      longitude: 95.35,
      source: SOURCE,
    },
    {
      id: 'eq-010',
      magnitude: 4.4,
      location: 'Laut Flores, Nusa Tenggara Timur',
      timestamp: minutesAgo(7200),
      depth: 40,
      latitude: null, // coordinates not reported
      longitude: null,
      source: SOURCE,
    },
    {
      id: 'eq-011',
      magnitude: 3.2,
      location: 'Kendari, Sulawesi Tenggara',
      timestamp: minutesAgo(8600),
      depth: 10,
      latitude: -3.95,
      longitude: 122.55,
      source: null, // source not recorded
    },
    {
      id: 'eq-012',
      magnitude: 5.6,
      location: 'Seram Bagian Barat, Maluku',
      timestamp: minutesAgo(10000),
      depth: 15,
      latitude: -3.2,
      longitude: 128.2,
      source: SOURCE,
    },
  ];
}