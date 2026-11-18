import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';

const item = 'block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-mist';

export function AccountMenu() {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="account-menu"
        aria-label="Account menu"
        className="grid h-9 w-9 place-items-center rounded-full bg-accent font-display text-base font-bold text-onaccent hover:bg-accent-dark"
      >
        {profile?.displayName.charAt(0).toUpperCase() ?? '?'}
      </button>

      {open && (
        <div id="account-menu" className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-line bg-surface p-1.5 shadow-xl shadow-black/30">
          {profile && (
            <div className="border-b border-line px-3 pb-2 pt-1.5">
              <p className="truncate text-sm font-semibold">{profile.displayName}</p>
              <p className="truncate text-xs text-mute">@{profile.username}</p>
            </div>
          )}
          <div className="mt-1.5 flex flex-col">
            <Link to="/profile" onClick={close} className={item}>Profile</Link>
            <Link to="/settings" onClick={close} className={item}>Settings</Link>
            <button onClick={() => { close(); signOut(); }} className={item}>Sign out</button>
          </div>
        </div>
      )}
    </div>
  );
}
