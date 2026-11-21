import { supabase } from '../lib/supabase';
import type { ContinueEntry } from '../types/media';

interface Row {
  media_id: number;
  title: string;
  poster_path: string | null;
  release_year: number | null;
  season: number;
  episode: number;
  url: string;
  updated_at: string;
}

const COLUMNS = 'media_id, title, poster_path, release_year, season, episode, url, updated_at';

/** One row per show, most recently saved first. The table is small (one row per show being followed). */
export async function fetchContinue(): Promise<ContinueEntry[]> {
  const { data, error } = await supabase
    .from('continue_watching')
    .select(COLUMNS)
    .order('updated_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);

  return (data as Row[]).map((r) => ({
    id: r.media_id,
    mediaType: 'tv',
    title: r.title,
    posterPath: r.poster_path,
    releaseYear: r.release_year,
    season: r.season,
    episode: r.episode,
    url: r.url,
    updatedAt: r.updated_at,
  }));
}

/** Row Level Security scopes this delete to the signed-in user. */
export async function removeContinue(mediaId: number): Promise<void> {
  const { error } = await supabase.from('continue_watching').delete().eq('media_id', mediaId);
  if (error) throw new Error(error.message);
}
