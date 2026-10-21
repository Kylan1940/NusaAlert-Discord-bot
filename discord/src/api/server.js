'use strict';

/**
 * Read-only HTTP API for the NusaAlert dashboard.
 *
 *   GET /api/earthquakes  -> { earthquakes: [...], skipped: number }
 *   GET /api/health       -> { ok: true }
 *
 * It only reads the `earthquakes` table and only exposes public BMKG fields
 * (no channel ids, no config). It uses Node's built-in `http`, so no new
 * dependency is needed. It stays disabled until a port is configured, and an
 * error here can never take the Discord bot down.
 *
 * Environment variables:
 *   API_PORT          Port to listen on. Falls back to SERVER_PORT, then PORT
 *                     (hosting panels usually set one of them).
 *   DASHBOARD_ORIGIN  Comma-separated list of allowed dashboard origins for
 *                     CORS, e.g. "https://nusaalert.example.com,http://localhost:5173"
 */

const http = require('http');
const db = require('../database/database');
const { mapEarthquake } = require('./mapEarthquake');

const MAX_ROWS = 1000;
const CACHE_MS = 10_000;

let cache = { at: 0, body: null };

function loadBody() {
  if (cache.body !== null && Date.now() - cache.at < CACHE_MS) return cache.body;

  const rows = db
    .prepare(
      `SELECT id, tanggal, jam, datetime, magnitude, kedalaman, wilayah, lintang, bujur
       FROM earthquakes
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .all(MAX_ROWS);

  const earthquakes = [];
  let skipped = 0;
  for (const row of rows) {
    const mapped = mapEarthquake(row);
    if (mapped) earthquakes.push(mapped);
    else skipped += 1;
  }

  cache = { at: Date.now(), body: JSON.stringify({ earthquakes, skipped }) };
  return cache.body;
}

function allowedOrigins() {
  return (process.env.DASHBOARD_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function send(res, status, body, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });
  res.end(body);
}

function handle(req, res) {
  try {
    const origin = req.headers.origin;
    const cors = {};
    if (origin && allowedOrigins().includes(origin)) {
      cors['Access-Control-Allow-Origin'] = origin;
      cors['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
      cors['Access-Control-Allow-Headers'] = 'Accept';
      cors.Vary = 'Origin';
    }

    const { pathname } = new URL(req.url || '/', 'http://localhost');

    if (req.method === 'OPTIONS') return send(res, 204, '', cors);
    if (req.method !== 'GET') return send(res, 405, '{"error":"Method not allowed"}', cors);

    if (pathname === '/api/health') return send(res, 200, '{"ok":true}', cors);
    if (pathname === '/api/earthquakes') return send(res, 200, loadBody(), cors);

    return send(res, 404, '{"error":"Not found"}', cors);
  } catch (error) {
    console.error('[api] request failed:', error.message);
    return send(res, 500, '{"error":"Internal error"}');
  }
}

function start() {
  const port = Number(process.env.API_PORT || process.env.SERVER_PORT || process.env.PORT);
  if (!Number.isInteger(port) || port <= 0) {
    console.log('[api] disabled. Set API_PORT to enable the earthquake API.');
    return null;
  }

  const server = http.createServer(handle);
  server.on('error', (error) => console.error('[api] server error:', error.message));
  server.listen(port, '0.0.0.0', () => console.log(`[api] listening on port ${port}`));
  return server;
}

module.exports = { start, handle };