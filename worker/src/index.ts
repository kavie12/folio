/**
 * Folio TMDB proxy.
 * Holds the TMDB read-access token server-side, exposes only the two
 * endpoint the app needs (search), validates input, and caches upstream responses.
 */
export interface Env {
  TMDB_TOKEN: string; // TMDB "API Read Access Token" (v4 bearer)
  ALLOWED_ORIGIN: string;
}

const TMDB = 'https://api.themoviedb.org/3';
const CACHE_TTL = { search: 300 };

const json = (body: unknown, status: number, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

async function fromTmdb(
  env: Env,
  ctx: ExecutionContext,
  path: string,
  params: Record<string, string>,
  ttl: number,
): Promise<Response> {
  const upstream = new URL(TMDB + path);
  Object.entries(params).forEach(([k, v]) => upstream.searchParams.set(k, v));

  const cache = caches.default;
  const cacheKey = new Request(upstream.toString()); // contains no secrets
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const res = await fetch(upstream.toString(), {
    headers: { Authorization: `Bearer ${env.TMDB_TOKEN}`, Accept: 'application/json' },
  });
  if (!res.ok) return json({ error: 'Upstream TMDB error' }, res.status === 404 ? 404 : 502);

  const out = new Response(res.body, {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${ttl}` },
  });
  ctx.waitUntil(cache.put(cacheKey, out.clone()));
  return out;
}

/** TMDB pages run 1 to 500. */
const pageParam = (url: URL) =>
  String(Math.min(Math.max(parseInt(url.searchParams.get('page') ?? '1', 10) || 1, 1), 500));

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const allowed = env.ALLOWED_ORIGIN.split(',').map((s) => s.trim());
    const origin = req.headers.get('Origin');
    const cors: Record<string, string> = {
      'Access-Control-Allow-Origin': origin && allowed.includes(origin) ? origin : allowed[0],
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin',
    };

    if (origin && !allowed.includes(origin)) return json({ error: 'Origin not allowed' }, 403, cors);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405, cors);

    const url = new URL(req.url);
    let upstream: Response;

    try {
      if (url.pathname === '/search') {
        const query = (url.searchParams.get('query') ?? '').trim().slice(0, 100);
        if (query.length < 2) return json({ error: 'query must be at least 2 characters' }, 400, cors);
        upstream = await fromTmdb(
          env, ctx, '/search/multi',
          { query, page: pageParam(url), include_adult: 'false', language: 'en-US' },
          CACHE_TTL.search,
        );
      } else {
        return json({ error: 'Not found' }, 404, cors);
      }
    } catch {
      return json({ error: 'Proxy failure' }, 502, cors);
    }

    const res = new Response(upstream.body, upstream);
    Object.entries(cors).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  },
};
