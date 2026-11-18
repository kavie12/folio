import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { validateDisplayName, validateUsername } from '../lib/validation';

type Mode = 'signin' | 'signup' | 'forgot';

const field = 'mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:border-accent';

export function AuthPage() {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [login, setLogin] = useState(''); // email or username
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (user) return <Navigate to="/" replace />;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === 'signup') {
      const problem = validateDisplayName(displayName) ?? validateUsername(username);
      if (problem) return setError(problem);
    }

    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(login, password);
      } else if (mode === 'signup') {
        const started = await signUp({ email, password, displayName, username });
        if (!started) {
          setNotice('Account created. Check your email to confirm it, then sign in.');
          setMode('signin');
        }
      } else {
        await resetPassword(email);
        // Same message whether or not the address has an account.
        setNotice('If an account uses that email, a reset link is on its way.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  const submitLabel = { signin: 'Sign in', signup: 'Create account', forgot: 'Send reset link' }[mode];
  const link = 'text-sm text-mute underline underline-offset-4 hover:text-ink';

  return (
    <div className="mx-auto flex min-h-screen max-w-sm animate-fade-up flex-col justify-center px-4 py-10">
      <Logo size={48} />
      <p className="mt-3 text-mute">A plain log of everything you’ve watched.</p>

      <form key={mode} onSubmit={onSubmit} className="mt-8 animate-fade-in space-y-4">
        {mode === 'signin' && (
          <label className="block text-sm font-medium">
            Email or username
            <input required autoComplete="username" autoCapitalize="none" value={login} onChange={(e) => setLogin(e.target.value)} className={field} />
          </label>
        )}

        {mode === 'signup' && (
          <>
            <label className="block text-sm font-medium">
              Display name
              <input required maxLength={40} autoComplete="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={field} />
            </label>
            <label className="block text-sm font-medium">
              Username
              <input required maxLength={21} autoCapitalize="none" autoComplete="off" value={username} onChange={(e) => setUsername(e.target.value)} className={field} />
              <span className="mt-1 block text-xs font-normal text-mute">Letters, numbers and underscores. You can sign in with it.</span>
            </label>
          </>
        )}

        {mode !== 'signin' && (
          <label className="block text-sm font-medium">
            Email
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          </label>
        )}

        {mode !== 'forgot' && (
          <label className="block text-sm font-medium">
            Password
            <input
              type="password" required minLength={mode === 'signup' ? 8 : undefined}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password} onChange={(e) => setPassword(e.target.value)} className={field}
            />
          </label>
        )}

        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        {notice && <p role="status" className="text-sm text-accent">{notice}</p>}

        <button type="submit" disabled={busy} className="w-full rounded-md bg-accent px-4 py-2.5 font-medium text-onaccent hover:bg-accent-dark disabled:opacity-60">
          {busy ? 'Please wait' : submitLabel}
        </button>
      </form>

      <div className="mt-4 flex flex-col items-start gap-2">
        {mode === 'signin' && (
          <>
            <button type="button" onClick={() => switchMode('forgot')} className={link}>Forgot your password?</button>
            <button type="button" onClick={() => switchMode('signup')} className={link}>New here? Create an account</button>
          </>
        )}
        {mode === 'signup' && <button type="button" onClick={() => switchMode('signin')} className={link}>Have an account? Sign in</button>}
        {mode === 'forgot' && <button type="button" onClick={() => switchMode('signin')} className={link}>Back to sign in</button>}
      </div>
    </div>
  );
}
