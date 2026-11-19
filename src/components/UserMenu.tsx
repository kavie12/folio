import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDismiss } from '../hooks/useDismiss';

const item = 'block w-full rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-mist focus-visible:bg-mist';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useDismiss(root, open, (reason) => {
    setOpen(false);
    if (reason === 'escape') trigger.current?.focus();
  });

  const email = user?.email ?? '';

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-full bg-accent font-display text-base font-bold text-on-accent ring-2 ring-transparent ring-offset-2 ring-offset-paper hover:ring-accent/60 aria-expanded:ring-accent"
      >
        {email.charAt(0).toUpperCase() || '?'}
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-56 origin-top-right animate-scale-in rounded-xl border border-line bg-surface p-1.5 shadow-xl shadow-black/30">
          <div className="border-b border-line px-3 pb-2 pt-1.5">
            <p className="text-xs text-mute">Signed in as</p>
            <p className="truncate text-sm font-semibold">{email}</p>
          </div>
          <div className="pt-1.5">
            <Link role="menuitem" to="/profile" onClick={() => setOpen(false)} className={item}>Profile</Link>
            <Link role="menuitem" to="/settings" onClick={() => setOpen(false)} className={item}>Settings</Link>
            <button role="menuitem" onClick={() => { setOpen(false); signOut(); }} className={`${item} text-danger`}>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
