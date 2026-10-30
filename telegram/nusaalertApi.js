const BASE_URL = process.env.NUSAALERT_API_URL;
const API_KEY = process.env.NUSAALERT_API_KEY || "";
const WEBSITE_URL = process.env.WEBSITE_URL || "https://project-ke26u.vercel.app/";
const TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 60 * 1000;

const cache = new Map(); // path -> { at, data }

/**
 * GET ke API dengan timeout + cache singkat.
 * Kalau API down tapi ada cache lama, pakai cache itu dan tandai stale.
 */
async function request(path, { fresh = false } = {}) {
  const cached = cache.get(path);
  if (!fresh && cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return { data: cached.data, stale: false };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      signal: controller.signal,
      headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {},
    });
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    const data = await res.json();
    cache.set(path, { at: Date.now(), data });
    return { data, stale: false };
  } catch (err) {
    if (cached) return { data: cached.data, stale: true };
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** ISO UTC -> "30 Okt 2026, 13:03:45 WIB" */
function formatWIB(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const w = new Date(d.getTime() + 7 * 60 * 60 * 1000); // WIB = UTC+7
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${p(w.getUTCDate())} ${BULAN[w.getUTCMonth()]} ${w.getUTCFullYear()}, ` +
    `${p(w.getUTCHours())}:${p(w.getUTCMinutes())}:${p(w.getUTCSeconds())} WIB`
  );
}

/**
 * Bentuk item dari API NusaAlert:
 * { id, magnitude, location, timestamp (ISO UTC), depth (km), latitude, longitude, source }
 */
function normalize(q) {
  return {
    timestamp: q.timestamp,
    time: formatWIB(q.timestamp),
    magnitude: Number(q.magnitude),
    depth: q.depth != null ? `${q.depth} km` : "-",
    place: q.location ?? "-",
  };
}

/**
 * Cari array gempa di respons, apa pun nama key pembungkusnya
 * (contoh: [..], { items: [..] }, { data: [..] }, { earthquakes: [..] },
 * { data: { earthquakes: [..] } }).
 */
function extractList(data, depth = 0) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object" || depth > 2) return [];
  for (const value of Object.values(data)) {
    const found = extractList(value, depth + 1);
    if (found.length) return found;
  }
  return [];
}

/** Riwayat gempa terbaru. Return { items, stale } */
async function getHistory({ limit = 10, minMagnitude, fresh = false } = {}) {
  const { data, stale } = await request("/api/earthquakes", { fresh });
  const list = extractList(data);

  if (!list.length) {
    console.warn(
      "[nusaalertApi] daftar gempa kosong. Respons API (dipotong):",
      JSON.stringify(data).slice(0, 500)
    );
  }

  let items = list
    .map(normalize)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const seen = new Set();
  items = items.filter((q) => {
    const key = `${q.timestamp}|${q.magnitude}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (minMagnitude != null) {
    items = items.filter((q) => q.magnitude >= minMagnitude);
  }
  return { items: items.slice(0, limit), stale };
}

/** Gempa paling baru saja. Return { item, stale } */
async function getLatest() {
  const { items, stale } = await getHistory({ limit: 1 });
  return { item: items[0] ?? null, stale };
}

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Format satu gempa untuk Telegram (parse_mode: "HTML") */
function formatQuake(q) {
  const mag = Number.isFinite(q.magnitude) ? q.magnitude.toFixed(1) : "?";
  return [
    `<b>M ${mag}</b> - ${esc(q.place)}`,
    `Waktu: ${esc(q.time)}`,
    `Kedalaman: ${esc(q.depth)}`,
  ].join("\n");
}

module.exports = { getHistory, getLatest, formatQuake, WEBSITE_URL };