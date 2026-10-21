'use strict';

/**
 * Converts one row of the `earthquakes` table (BMKG text fields as stored by
 * gempaRepository.js) into the clean shape the dashboard expects.
 *
 * Nothing is invented: a value that cannot be parsed becomes null, and a row
 * without a usable id, time, magnitude or location is dropped (returns null).
 */

const SOURCE = 'BMKG';

// BMKG writes Indonesian month abbreviations ("Okt", "Agu", "Mei", "Des").
// English abbreviations are accepted too.
const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, may: 4, jun: 5,
  jul: 6, agu: 7, agt: 7, aug: 7, sep: 8, okt: 9, oct: 9, nov: 10, des: 11, dec: 11,
};

const TIMEZONE_OFFSET_HOURS = { WIB: 7, WITA: 8, WIT: 9, UTC: 0, GMT: 0 };

// "21 Okt 2026 14:44:15 WIB" (tanggal + jam, as saved in `datetime`)
const DATETIME_PATTERN =
  /^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([A-Za-z]+)?$/;

/** Returns an ISO 8601 UTC string, or null. */
function parseDateTime(raw) {
  if (typeof raw !== 'string') return null;
  const match = raw.trim().match(DATETIME_PATTERN);
  if (!match) return null;

  const day = Number(match[1]);
  const month = MONTHS[match[2].slice(0, 3).toLowerCase()];
  const year = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = match[6] === undefined ? 0 : Number(match[6]);
  // BMKG always reports WIB; assume it only when the zone is missing.
  const offset = match[7] === undefined ? 7 : TIMEZONE_OFFSET_HOURS[match[7].toUpperCase()];

  if (month === undefined || offset === undefined) return null;
  if (day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) return null;

  const date = new Date(Date.UTC(year, month, day, hour - offset, minute, second));
  // Reject overflow such as "31 Feb".
  const local = new Date(date.getTime() + offset * 3_600_000);
  if (local.getUTCDate() !== day || local.getUTCMonth() !== month) return null;
  return date.toISOString();
}

/** "96 km" -> 96. Returns null when there is no number ("-", "", null). */
function parseDepth(raw) {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  if (typeof raw !== 'string') return null;
  const match = raw.match(/-?\d+(?:[.,]\d+)?/);
  if (!match) return null;
  const value = Number(match[0].replace(',', '.'));
  return Number.isFinite(value) ? value : null;
}

const LATITUDE_SIGN = { LS: -1, S: -1, LU: 1, N: 1 };
const LONGITUDE_SIGN = { BT: 1, E: 1, BB: -1, W: -1 };

/** "7.75 LS" -> -7.75, "128.18 BT" -> 128.18, "-7.75" -> -7.75, else null. */
function parseCoordinate(raw, signs, limit) {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) && Math.abs(raw) <= limit ? raw : null;
  }
  if (typeof raw !== 'string') return null;
  const match = raw.trim().match(/^(-?\d+(?:[.,]\d+)?)\s*([A-Za-z]+)?$/);
  if (!match) return null;

  const magnitude = Number(match[1].replace(',', '.'));
  if (!Number.isFinite(magnitude)) return null;

  let value = magnitude;
  if (match[2] !== undefined) {
    const sign = signs[match[2].toUpperCase()];
    if (sign === undefined) return null;
    value = Math.abs(magnitude) * sign;
  }
  return Math.abs(value) <= limit ? value : null;
}

function mapEarthquake(row) {
  if (!row || typeof row.id !== 'string' || row.id === '') return null;

  const timestamp =
    parseDateTime(row.datetime) ?? parseDateTime(`${row.tanggal ?? ''} ${row.jam ?? ''}`);
  const location = typeof row.wilayah === 'string' ? row.wilayah.trim() : '';
  const magnitude = typeof row.magnitude === 'number' ? row.magnitude : Number.NaN;

  if (timestamp === null || location === '' || !Number.isFinite(magnitude)) return null;

  const latitude = parseCoordinate(row.lintang, LATITUDE_SIGN, 90);
  const longitude = parseCoordinate(row.bujur, LONGITUDE_SIGN, 180);
  const hasPosition = latitude !== null && longitude !== null;

  return {
    id: row.id,
    magnitude,
    location,
    timestamp,
    depth: parseDepth(row.kedalaman),
    // Only expose a position when both halves are valid.
    latitude: hasPosition ? latitude : null,
    longitude: hasPosition ? longitude : null,
    source: SOURCE,
  };
}

module.exports = { mapEarthquake, parseDateTime, parseDepth, parseCoordinate };