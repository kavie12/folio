import { supabase } from '../lib/supabase';
import { mediaKey, type HistoryFilter, type MediaItem, type MediaType, type WatchEntry } from '../types/media';

export const HISTORY_PAGE_SIZE = 20;

interface Row {
  media_id: number;
  media_type: MediaType;
  title: string;
  poster_path: string | null;
  release_year: number | null;
  watched_at: string;
}

const fromRow = (r: Row): WatchEntry => ({
  id: r.media_id,
  mediaType: r.media_type,
  title: r.title,
  posterPath: r.poster_path,
  releaseYear: r.release_year,
  watchedAt: r.watched_at,
});

export interface HistoryPage {
  entries: WatchEntry[];
  total: number;
}

/** Escape LIKE wildcards so a search for "100%" matches literally. */
const likePattern = (term: string) => `%${term.replace(/[\\%_]/g, '\\$&')}%`;

export async function fetchHistoryPage(filter: HistoryFilter, page: number, search = ''): Promise<HistoryPage> {
  const term = search.trim();
  const from = (page - 1) * HISTORY_PAGE_SIZE;

  let query = supabase
    .from('watch_history')
    .select('media_id, media_type, title, poster_path, release_year, watched_at', { count: 'exact' })
    .order('watched_at', { ascending: false })
    .order('id', { ascending: false }) // stable order when timestamps tie
    .range(from, from + HISTORY_PAGE_SIZE - 1);
  if (filter !== 'all') query = query.eq('media_type', filter);
  if (term) query = query.ilike('title', likePattern(term));

  const { data, error, count } = await query;

  if (error) {
    // Page is past the end (e.g. the last item on it was just removed): report the total so the UI can step back.
    if (error.code === 'PGRST103') {
      let head = supabase.from('watch_history').select('id', { count: 'exact', head: true });
      if (filter !== 'all') head = head.eq('media_type', filter);
      if (term) head = head.ilike('title', likePattern(term));
      const { count: total } = await head;
      return { entries: [], total: total ?? 0 };
    }
    throw new Error(error.message);
  }
  return { entries: (data as Row[]).map(fromRow), total: count ?? 0 };
}

/** Which of the given titles the user has watched, as `type:id` keys. */
export async function fetchWatchedKeys(items: MediaItem[]): Promise<string[]> {
  if (items.length === 0) return [];
  const { data, error } = await supabase
    .from('watch_history')
    .select('media_id, media_type')
    .in('media_id', items.map((i) => i.id));
  if (error) throw new Error(error.message);
  return (data as Pick<Row, 'media_id' | 'media_type'>[]).map((r) =>
    mediaKey({ id: r.media_id, mediaType: r.media_type }),
  );
}

export async function addWatched(userId: string, item: MediaItem): Promise<void> {
  const { error } = await supabase.from('watch_history').upsert(
    {
      user_id: userId,
      media_id: item.id,
      media_type: item.mediaType,
      title: item.title,
      poster_path: item.posterPath,
      release_year: item.releaseYear,
    },
    { onConflict: 'user_id,media_id,media_type', ignoreDuplicates: true },
  );
  if (error) throw new Error(error.message);
}

/** Row Level Security scopes this delete to the signed-in user. */
export async function removeWatched(item: MediaItem): Promise<void> {
  const { error } = await supabase
    .from('watch_history')
    .delete()
    .eq('media_id', item.id)
    .eq('media_type', item.mediaType);
  if (error) throw new Error(error.message);
}

/** Every entry, newest first, fetched in chunks. Used for CSV export. */
export async function fetchAllHistory(): Promise<WatchEntry[]> {
  const CHUNK = 1000;
  const all: WatchEntry[] = [];
  for (let from = 0; ; from += CHUNK) {
    const { data, error } = await supabase
      .from('watch_history')
      .select('media_id, media_type, title, poster_path, release_year, watched_at')
      .order('watched_at', { ascending: false })
      .order('id', { ascending: false })
      .range(from, from + CHUNK - 1);
    if (error) throw new Error('Couldn’t export your history. Try again.');
    all.push(...(data as Row[]).map(fromRow));
    if (data.length < CHUNK) return all;
  }
}

export async function fetchCounts(): Promise<{ movies: number; tv: number }> {
  const count = async (type: MediaType) => {
    const { count, error } = await supabase
      .from('watch_history')
      .select('id', { count: 'exact', head: true })
      .eq('media_type', type);
    if (error) throw new Error(error.message);
    return count ?? 0;
  };
  const [movies, tv] = await Promise.all([count('movie'), count('tv')]);
  return { movies, tv };
}
