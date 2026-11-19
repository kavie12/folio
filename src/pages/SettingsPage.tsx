import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { fetchAllHistory } from '../api/history';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { SegmentedControl } from '../components/SegmentedControl';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useTheme, type Theme } from '../hooks/useTheme';
import { downloadCsv, historyToCsv } from '../lib/csv';

const THEMES: { id: Theme; label: string }[] = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
];

const panel = 'rounded-xl border border-line bg-surface p-5';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { deleteAccount } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();

  const [exporting, setExporting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function exportCsv() {
    setExporting(true);
    try {
      const entries = await fetchAllHistory();
      if (entries.length === 0) return toast.show('Your history is empty, so there is nothing to export.', 'error');
      downloadCsv(`folio-history-${new Date().toISOString().slice(0, 10)}.csv`, historyToCsv(entries));
      toast.show(`Exported ${entries.length} ${entries.length === 1 ? 'title' : 'titles'}`);
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Couldn’t export your history. Try again.', 'error');
    } finally {
      setExporting(false);
    }
  }

  async function onDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      qc.clear();
      navigate('/auth', { replace: true });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Couldn’t delete your account. Try again.');
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>

      <section className={panel}>
        <h2 className="font-display text-lg font-semibold">Appearance</h2>
        <p className="mt-1 text-sm text-mute">Folio is dark by default.</p>
        <div className="mt-4">
          <SegmentedControl label="Theme" options={THEMES} value={theme} onChange={setTheme} />
        </div>
      </section>

      <section className={panel}>
        <h2 className="font-display text-lg font-semibold">Password</h2>
        <p className="mt-1 text-sm text-mute">Choose a new password for signing in.</p>
        <ChangePasswordForm />
      </section>

      <section className={panel}>
        <h2 className="font-display text-lg font-semibold">Your data</h2>
        <p className="mt-1 text-sm text-mute">
          Download your whole watch history as a CSV file: title, type, release year, TMDB ID and the date you watched it.
        </p>
        <button
          onClick={exportCsv}
          disabled={exporting}
          className="mt-4 rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-mist disabled:opacity-60"
        >
          {exporting ? 'Exporting' : 'Export history as CSV'}
        </button>
      </section>

      <section className={`${panel} border-danger/40`}>
        <h2 className="font-display text-lg font-semibold text-danger">Delete account</h2>
        <p className="mt-1 text-sm text-mute">
          This permanently deletes your account and watch history. It can’t be undone. Export your history above first if you want a copy.
        </p>

        {!confirming ? (
          <button onClick={() => setConfirming(true)} className="mt-4 rounded-md border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger hover:text-paper">
            Delete account
          </button>
        ) : (
          <div className="mt-4 animate-fade-in space-y-3">
            <label className="block text-sm font-medium">
              Type DELETE to confirm
              <input
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                autoComplete="off"
                className="mt-1 w-full max-w-xs rounded-md border border-line bg-paper px-3 py-2 outline-none focus:border-danger"
              />
            </label>
            {deleteError && <p role="alert" className="text-sm text-danger">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                onClick={onDelete}
                disabled={phrase !== 'DELETE' || deleting}
                className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-paper disabled:opacity-50"
              >
                {deleting ? 'Deleting' : 'Permanently delete account'}
              </button>
              <button
                onClick={() => { setConfirming(false); setPhrase(''); setDeleteError(null); }}
                disabled={deleting}
                className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-mist"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
