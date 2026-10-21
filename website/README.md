# NusaAlert Earthquake History

Frontend-only UI preview built with Vite, React and TypeScript. It uses local
demonstration data. There is no backend, API, database or live data.

## Run

```bash
npm install
npm run dev      # development server
npm run build    # type-check and production build
npm run lint
```

## Structure

```
src/
  components/   Navbar, LatestEarthquakeCard, StatCard, EarthquakeMapPanel,
                EarthquakeFilters, EarthquakeHistoryTable, MagnitudeBadge,
                EmptyState, LoadingState, Hero
  data/         mockEarthquakes.ts (demo records)
  pages/        Dashboard.tsx
  types/        earthquake.ts
  utils/        earthquakeUtils.ts (formatting, stats, filtering, sorting)
  App.tsx       the only place the data source is chosen
  index.css     design tokens (CSS variables) and styles
```

## Connecting real data later

Components receive data through props and never import the mock data.
`App.tsx` calls `getMockEarthquakes()` and passes the result to `Dashboard`.
Replace that with a real source that returns `Earthquake[]` (see
`src/types/earthquake.ts`), and pass `status="loading"` or
`status="unavailable"` when appropriate. `EarthquakeMapPanel` only
depends on its props, so it can be swapped for another map implementation.

## Google Maps

The map uses the Maps JavaScript API (`@vis.gl/react-google-maps`).

1. Copy `.env.example` to `.env`.
2. Set `VITE_GOOGLE_MAPS_API_KEY`. Create a separate browser key in Google
   Cloud, restricted to the Maps JavaScript API and to your HTTP referrers
   (`http://localhost:5173/*` and your domain).
3. Optionally set `VITE_GOOGLE_MAP_ID` (a Vector, JavaScript Map ID). It
   defaults to `DEMO_MAP_ID`, which Google provides for development.
4. Restart `npm run dev` after changing `.env`.

Without a key the map panel shows a "Map unavailable" message. `.env` is
git-ignored; never commit it.

## Colours

All colours are CSS variables in the `:root` block of `src/index.css`.
