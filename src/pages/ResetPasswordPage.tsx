import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Spinner } from '../components/States';
import { useAuth } from '../context/AuthContext';

/** Landing page for the link in the reset email. Supabase signs the user in with a recovery session. */
export function ResetPasswordPage() {
  const { user, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) return setError('The passwords don’t match.');
    setBusy(true);
    setError(null);
    try {
      await updatePassword(password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t update your password. Try again.');
      setBusy(false);
    }
  }

  const field = 'mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:border-accent';

  return (
    <div className="mx-auto flex min-h-screen max-w-sm animate-fade-up flex-col justify-center px-4 py-10">
      <Logo size={40} />
      {loading ? (
        <Spinner label="Checking your link" />
      ) : !user ? (
        <div className="mt-8">
          <h1 className="font-display text-xl font-semibold">This reset link has expired</h1>
          <p className="mt-2 text-mute">Request a new one from the sign-in page.</p>
          <Link to="/auth" className="mt-4 inline-block rounded-md bg-accent px-4 py-2 font-medium text-onaccent hover:bg-accent-dark">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <h1 className="font-display text-xl font-semibold">Choose a new password</h1>
          <label className="block text-sm font-medium">
            New password
            <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
          </label>
          <label className="block text-sm font-medium">
            Confirm password
            <input type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} />
          </label>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-md bg-accent px-4 py-2.5 font-medium text-onaccent hover:bg-accent-dark disabled:opacity-60">
            {busy ? 'Please wait' : 'Save new password'}
          </button>
        </form>
      )}
    </div>
  );
}
