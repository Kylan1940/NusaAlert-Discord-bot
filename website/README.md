# NusaAlert Earthquake Dashboard

## Earthquake API proxy configuration

The browser now requests the same-origin endpoint `/api/earthquakes` instead of calling an HTTP IP directly. This avoids browser Mixed Content blocking.

### Local development
1. Copy `.env.example` to `.env`.
2. Set `NUSAALERT_API_BASE_URL` to the actual API origin, without a trailing slash.
3. Run `npm install` and `npm run dev`.

Vite proxies `/api/*` to that backend during development.

### Vercel deployment
Add the environment variable `NUSAALERT_API_BASE_URL` in Vercel Project Settings → Environment Variables. Set it to the real backend origin, for example `http://YOUR-BACKEND-HOST:16034`, without a trailing slash, then redeploy. The `api/earthquakes.ts` serverless function proxies the request from Vercel to the backend, so the browser only communicates with the HTTPS Vercel domain.

**Important:** the uploaded project's `.env` pointed to `78.154.103.9:16034`, while the browser console screenshot showed `78.154.193.9:16034`. Confirm which address is correct before setting the environment variable. The proxy cannot fix an incorrect or unreachable backend address. For production, HTTPS on the backend is preferable when available.
