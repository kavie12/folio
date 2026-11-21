export type MediaType = 'movie' | 'tv';
export type HistoryFilter = 'all' | MediaType;

export interface MediaItem {
  id: number; // TMDB id
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  releaseYear: number | null;
}

/** Latest watched point in a TV show. */
export interface TvProgress {
  season: number;
  episode: number | null; // optional
}

export interface WatchEntry extends MediaItem {
  watchedAt: string; // ISO timestamp
  progress: TvProgress | null; // TV shows only
}

/** The next episode to watch for a show, with the link to open it. */
export interface ContinueEntry extends MediaItem {
  mediaType: 'tv';
  season: number;
  episode: number;
  url: string;
  updatedAt: string; // ISO timestamp
}

export const mediaKey = (m: Pick<MediaItem, 'id' | 'mediaType'>) => `${m.mediaType}:${m.id}`;

export const kindLabel = (m: Pick<MediaItem, 'mediaType'>) => (m.mediaType === 'movie' ? 'Movie' : 'TV show');

/** Short form, e.g. "S3E3", or "S3" when no episode is set. */
export const progressLabel = (p: TvProgress) => `S${p.season}${p.episode !== null ? `E${p.episode}` : ''}`;
