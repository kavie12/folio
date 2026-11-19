import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

const input = 'mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 outline-none focus:border-accent';

export function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setCurrent('');
    setNext('');
    setConfirm('');
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (next !== confirm) return setError('The new passwords don’t match.');
    if (next === current) return setError('Choose a password different from your current one.');

    setBusy(true);
    setError(null);
    try {
      await changePassword(current, next);
      toast.show('Password updated');
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t update your password. Try again.');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-4 rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-mist">
        Change password
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 animate-fade-in space-y-3">
      <label className="block text-sm font-medium">
        Current password
        <input autoFocus type="password" required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={input} />
      </label>
      <label className="block text-sm font-medium">
        New password
        <input type="password" required minLength={8} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={input} />
      </label>
      <label className="block text-sm font-medium">
        Confirm new password
        <input type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
      </label>

      {error && <p role="alert" className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-hover disabled:opacity-60">
          {busy ? 'Updating' : 'Update password'}
        </button>
        <button type="button" onClick={close} disabled={busy} className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-mist">
          Cancel
        </button>
      </div>
    </form>
  );
}
