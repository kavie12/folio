import { useRemoveContinue } from '../hooks/useContinue';
import { safeHttpUrl } from '../lib/url';
import { timeAgo } from '../lib/time';
import type { ContinueEntry } from '../types/media';
import { CardMenu } from './CardMenu';
import { Poster } from './Poster';

/** Card on the Continue page: the next episode, and a link straight to it. */
export function ContinueCard({ entry, index = 0 }: { entry: ContinueEntry; index?: number }) {
  const remove = useRemoveContinue();
  const href = safeHttpUrl(entry.url); // never render an unsafe scheme as a link
  const host = href ? new URL(href).hostname : null;

  return (
    <li
      className="group relative flex animate-fade-up flex-col gap-2 hover:z-20 has-[[aria-expanded=true]]:z-20"
      style={{ animationDelay: `${Math.min(index, 14) * 40}ms` }}
    >
      <Poster item={entry}>
        <span className="absolute left-2 top-2 animate-pop rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-on-accent shadow-md">
          S{entry.season}E{entry.episode}
        </span>
        <div className="absolute right-2 top-2">
          <CardMenu
            label={`Options for ${entry.title}`}
            items={[{ label: 'Remove from Continue', danger: true, onSelect: () => remove.mutate(entry.id) }]}
          />
        </div>
      </Poster>

      <div className="min-h-[3.25rem]">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{entry.title}</h3>
        <p className="mt-0.5 text-xs text-mute">Season {entry.season}, episode {entry.episode}</p>
        <p className="text-xs text-mute">
          {host ? `${host}, ` : ''}saved {timeAgo(entry.updatedAt)}
        </p>
      </div>

      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-md bg-accent px-3 py-2 text-center text-sm font-medium text-on-accent transition hover:bg-accent-hover active:scale-[0.98]"
        >
          Continue
        </a>
      ) : (
        <span className="block rounded-md border border-line px-3 py-2 text-center text-sm text-mute">Link unavailable</span>
      )}
    </li>
  );
}
