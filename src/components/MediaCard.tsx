import { posterUrl } from '../api/tmdb';
import type { MediaItem, WatchEntry } from '../types/media';
import { WatchedButton } from './WatchedButton';

const kindLabel = (m: MediaItem) => (m.mediaType === 'movie' ? 'Movie' : 'TV show');
const dateFmt = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

interface Props {
  item: MediaItem | WatchEntry;
  watched: boolean;
  disabled?: boolean;
  index?: number; // position in the grid, for the staggered entrance
}

export function MediaCard({ item, watched, disabled, index = 0 }: Props) {
  const poster = posterUrl(item.posterPath);
  const watchedAt = 'watchedAt' in item ? item.watchedAt : null;

  return (
    <li className="group flex animate-fade-up flex-col gap-2" style={{ animationDelay: `${Math.min(index, 14) * 40}ms` }}>
      <div
        className={`relative aspect-[2/3] overflow-hidden rounded-lg bg-mist ring-1 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-black/30 ${
          watched ? 'ring-accent/60' : 'ring-line'
        }`}
      >
        {poster ? (
          <img
            src={poster}
            alt={`Poster for ${item.title}`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center p-3 text-center text-sm text-mute">{item.title}</div>
        )}
        {watched && (
          <span className="absolute left-2 top-2 flex animate-pop items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-on-accent shadow-md">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2.5 6.2l2.2 2.2L9.5 3.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Watched
          </span>
        )}
      </div>

      <div className="min-h-[3.25rem]">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{item.title}</h3>
        <p className="mt-0.5 text-xs text-mute">
          {item.releaseYear ?? 'Year unknown'}, {kindLabel(item)}
        </p>
        {watchedAt && <p className="text-xs text-mute">Watched {dateFmt.format(new Date(watchedAt))}</p>}
      </div>

      <WatchedButton item={item} watched={watched} disabled={disabled} />
    </li>
  );
}
