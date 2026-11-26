import { useState, type FormEvent } from 'react';
import type { TvProgress, WatchEntry } from '../types/media';
import { Modal } from './Modal';

interface Props {
  entry: WatchEntry;
  onSave: (progress: TvProgress) => void;
  onClear: () => void;
  onClose: () => void;
}

const input = 'mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 outline-none focus:border-accent';

/** Lets the user record the latest season and episode they watched. */
export function ProgressDialog({ entry, onSave, onClear, onClose }: Props) {
  const [season, setSeason] = useState(entry.progress ? String(entry.progress.season) : '');
  const [episode, setEpisode] = useState(entry.progress?.episode != null ? String(entry.progress.episode) : '');
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const s = Number(season);
    const ep = episode.trim() === '' ? null : Number(episode); // episode is optional
    if (!Number.isInteger(s) || s < 1 || s > 99) return setError('Enter a season from 1 to 99.');
    if (ep !== null && (!Number.isInteger(ep) || ep < 1 || ep > 999)) return setError('Enter an episode from 1 to 999, or leave it blank.');
    onSave({ season: s, episode: ep });
  }

  return (
    <Modal labelledBy="progress-title" onClose={onClose}>
      <form onSubmit={submit}>
        <h2 id="progress-title" className="font-display text-lg font-semibold">Where are you up to?</h2>
        <p className="mt-1 text-sm text-mute">Latest season and episode you watched of {entry.title}. Leave the episode blank if you finished the whole season.</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">
            Season
            <input autoFocus type="number" inputMode="numeric" min={1} max={99} required value={season}
              onChange={(e) => { setSeason(e.target.value); setError(null); }} className={input} />
          </label>
          <label className="block text-sm font-medium">
            Episode <span className="font-normal text-mute">(optional)</span>
            <input type="number" inputMode="numeric" min={1} max={999} value={episode}
              onChange={(e) => { setEpisode(e.target.value); setError(null); }} className={input} />
          </label>
        </div>

        {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}

        <div className="mt-6 flex items-center justify-between gap-2">
          {entry.progress ? (
            <button type="button" onClick={onClear} className="text-sm font-medium text-mute underline underline-offset-4 hover:text-danger">
              Clear progress
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-mist">
              Cancel
            </button>
            <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-hover">
              Save
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
