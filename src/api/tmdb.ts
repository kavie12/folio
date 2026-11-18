import type { MediaItem } from '../types/media';

const PROXY = (import.meta.env.VITE_TMDB_PROXY_URL ?? '').replace(/\/$/, '');
/** TMDB refuses pages beyond 500. */
const MAX_PAGES = 500;

interface TmdbResult {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
}

interface TmdbPage {
  page: number;
  total_pages: number;
  results: TmdbResult[];
}

export interface MediaPage {
  items: MediaItem[];
  page: number;
  totalPages: number;
}

export const posterUrl = (path: string | null, size: 'w185' | 'w342' = 'w342') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

/** Maps a TMDB result to our model. Returns null for people and unknown types. */
function toMediaItem(r: TmdbResult): MediaItem | null {
  if (r.media_type !== 'movie' && r.media_type !== 'tv') return null;
  const date = r.release_date || r.first_air_date;
  const year = date ? parseInt(date.slice(0, 4), 10) : NaN;
  return {
    id: r.id,
    mediaType: r.media_type,
    title: r.title || r.name || 'Untitled',
    posterPath: r.poster_path,
    releaseYear: Number.isNaN(year) ? null : year,
  };
}

async function get(path: string, params: Record<string, string | number>): Promise<MediaPage> {
  const url = new URL(PROXY + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error('Could not reach the search service. Check your connection and try again.');
  }
  if (!res.ok) throw new Error('Search is unavailable right now. Try again in a moment.');

  const data: TmdbPage = await res.json();
  return {
    items: data.results.map(toMediaItem).filter((m): m is MediaItem => m !== null),
    page: data.page ?? 1,
    totalPages: Math.min(data.total_pages ?? 1, MAX_PAGES),
  };
}

export const searchMedia = (query: string, page: number) => get('/search', { query, page });
