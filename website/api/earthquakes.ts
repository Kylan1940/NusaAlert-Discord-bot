declare const process: { env: Record<string, string | undefined> };

interface ProxyRequest {
  method?: string;
}

interface ProxyResponse {
  setHeader(name: string, value: string): void;
  status(code: number): ProxyResponse;
  json(body: unknown): ProxyResponse;
  send(body: string): ProxyResponse;
}

export default async function handler(req: ProxyRequest, res: ProxyResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const baseUrl = process.env.NUSAALERT_API_BASE_URL?.trim().replace(/\/+$/, '');
  if (!baseUrl) {
    return res.status(500).json({
      error: 'NUSAALERT_API_BASE_URL is not configured on the deployment.',
    });
  }

  try {
    const upstream = await fetch(`${baseUrl}/api/earthquakes`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });

    const body = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(body);
  } catch {
    return res.status(502).json({
      error: 'Unable to reach the NusaAlert earthquake API.',
    });
  }
}
