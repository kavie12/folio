import { useState } from 'react';
import { useToggleWatched } from '../hooks/useHistory';
import type { MediaItem } from '../types/media';
import { ConfirmDialog } from './ConfirmDialog';

export function WatchedButton({ item, watched, disabled }: { item: MediaItem; watched: boolean; disabled?: boolean }) {
  const toggle = useToggleWatched();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-pressed={watched}
        disabled={disabled}
        // Adding is instant; removing asks first.
        onClick={() => (watched ? setConfirming(true) : toggle.mutate({ item, watched }))}
        className={`w-full rounded-md px-3 py-2 text-sm font-medium disabled:opacity-60 ${
          watched
            ? 'border border-line text-mute hover:border-danger hover:text-danger'
            : 'bg-accent text-on-accent hover:bg-accent-hover'
        }`}
      >
        {watched ? 'Remove from history' : 'Mark as watched'}
      </button>

      {confirming && (
        <ConfirmDialog
          title={`Remove “${item.title}”?`}
          body="It will be removed from your history, along with the date you watched it."
          confirmLabel="Remove"
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            toggle.mutate({ item, watched });
          }}
        />
      )}
    </>
  );
}
