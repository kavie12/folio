import type { ReactNode } from 'react';
import { posterUrl } from '../api/tmdb';
import type { MediaItem } from '../types/media';

/**
 * Poster tile with hover lift. Must sit inside an element with the `group` class.
 * Only the image is clipped, so `children` (badges, menus) can overlay it and a dropdown can extend past the edge.
 */
export function Poster({ item, highlight = false, children }: { item: MediaItem; highlight?: boolean; children?: ReactNode }) {
  const src = posterUrl(item.posterPath);

  return (
    <div
      className={`relative aspect-[2/3] rounded-lg ring-1 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-black/30 ${
        highlight ? 'ring-accent/60' : 'ring-line'
      }`}
    >
      <div className="absolute inset-0 overflow-hidden rounded-lg bg-mist">
        {src ? (
          <img
            src={src}
            alt={`Poster for ${item.title}`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center p-3 text-center text-sm text-mute">{item.title}</div>
        )}
      </div>
      {children}
    </div>
  );
}
