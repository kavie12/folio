import { kindLabel, type MediaItem } from '../types/media';
import { Poster } from './Poster';
import { WatchedButton } from './WatchedButton';

interface Props {
  item: MediaItem;
  watched: boolean;
  disabled?: boolean;
  index?: number; // position in the grid, for the staggered entrance
}

/** Card used in search results. */
export function MediaCard({ item, watched, disabled, index = 0 }: Props) {
  return (
    <li className="group flex animate-fade-up flex-col gap-2" style={{ animationDelay: `${Math.min(index, 14) * 40}ms` }}>
      <Poster item={item} highlight={watched}>
        {watched && (
          <span className="absolute left-2 top-2 flex animate-pop items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-on-accent shadow-md">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2.5 6.2l2.2 2.2L9.5 3.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Watched
          </span>
        )}
      </Poster>

      <div className="min-h-[3.25rem]">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{item.title}</h3>
        <p className="mt-0.5 text-xs text-mute">
          {item.releaseYear ?? 'Year unknown'}, {kindLabel(item)}
        </p>
      </div>

      <WatchedButton item={item} watched={watched} disabled={disabled} />
    </li>
  );
}
