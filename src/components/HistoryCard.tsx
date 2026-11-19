import { useState } from 'react';
import { useToggleWatched, useUpdateProgress } from '../hooks/useHistory';
import { kindLabel, progressLabel, type WatchEntry } from '../types/media';
import { CardMenu, type MenuItem } from './CardMenu';
import { ConfirmDialog } from './ConfirmDialog';
import { Poster } from './Poster';
import { ProgressDialog } from './ProgressDialog';

const dateFmt = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/** Card used on the History page: progress label top left, ⋮ menu top right. */
export function HistoryCard({ entry, index = 0 }: { entry: WatchEntry; index?: number }) {
  const [dialog, setDialog] = useState<'progress' | 'remove' | null>(null);
  const toggle = useToggleWatched();
  const progress = useUpdateProgress();
  const isTv = entry.mediaType === 'tv';
  const label = entry.progress ? progressLabel(entry.progress) : null;

  const items: MenuItem[] = [
    ...(isTv ? [{ label: entry.progress ? 'Update progress' : 'Set season and episode', onSelect: () => setDialog('progress') }] : []),
    { label: 'Remove from history', danger: true, onSelect: () => setDialog('remove') },
  ];

  return (
    // Raised while hovered or while its menu is open, so the dropdown overlaps the next row.
    <li
      className="group relative flex animate-fade-up flex-col gap-2 hover:z-20 has-[[aria-expanded=true]]:z-20"
      style={{ animationDelay: `${Math.min(index, 14) * 40}ms` }}
    >
      <Poster item={entry}>
        {entry.progress && label && (
          <span
            key={label} // replays the pop when progress changes
            title={`Season ${entry.progress.season}${entry.progress.episode !== null ? `, episode ${entry.progress.episode}` : ''}`}
            className="absolute left-2 top-2 animate-pop rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-on-accent shadow-md"
          >
            {label}
          </span>
        )}
        <div className="absolute right-2 top-2">
          <CardMenu label={`Options for ${entry.title}`} items={items} />
        </div>
      </Poster>

      <div className="min-h-[3.25rem]">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{entry.title}</h3>
        <p className="mt-0.5 text-xs text-mute">
          {entry.releaseYear ?? 'Year unknown'}, {kindLabel(entry)}
        </p>
        <p className="text-xs text-mute">Watched {dateFmt.format(new Date(entry.watchedAt))}</p>
      </div>

      {dialog === 'remove' && (
        <ConfirmDialog
          title={`Remove “${entry.title}”?`}
          body="It will be removed from your history, along with the date you watched it."
          confirmLabel="Remove"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            setDialog(null);
            toggle.mutate({ item: entry, watched: true });
          }}
        />
      )}

      {dialog === 'progress' && (
        <ProgressDialog
          entry={entry}
          onClose={() => setDialog(null)}
          onSave={(p) => { setDialog(null); progress.mutate({ item: entry, progress: p }); }}
          onClear={() => { setDialog(null); progress.mutate({ item: entry, progress: null }); }}
        />
      )}
    </li>
  );
}
