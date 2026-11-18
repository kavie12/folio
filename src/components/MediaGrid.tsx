import { useWatchedKeys } from '../hooks/useHistory';
import { mediaKey, type MediaItem } from '../types/media';
import { GRID_CLASS } from './grid';
import { MediaCard } from './MediaCard';

export function MediaGrid({ items }: { items: MediaItem[] }) {
  const { keys, ready } = useWatchedKeys(items);

  return (
    <ul className={GRID_CLASS}>
      {items.map((item, i) => (
        <MediaCard key={mediaKey(item)} item={item} index={i} watched={keys.has(mediaKey(item))} disabled={!ready} />
      ))}
    </ul>
  );
}
