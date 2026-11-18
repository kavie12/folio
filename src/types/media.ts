export type MediaType = 'movie' | 'tv';
export type HistoryFilter = 'all' | MediaType;

export interface MediaItem {
  id: number; // TMDB id
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  releaseYear: number | null;
}

export interface WatchEntry extends MediaItem {
  watchedAt: string; // ISO timestamp
}

export const mediaKey = (m: Pick<MediaItem, 'id' | 'mediaType'>) => `${m.mediaType}:${m.id}`;
