import { useRef, useState } from 'react';
import { useDismiss } from '../hooks/useDismiss';

export interface MenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
}

/** "More options" button with a dropdown, styled to sit on top of a poster. */
export function CardMenu({ label, items }: { label: string; items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useDismiss(root, open, (reason) => {
    setOpen(false);
    if (reason === 'escape') trigger.current?.focus();
  });

  return (
    <div ref={root} className="relative shrink-0">
      <button
        ref={trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white shadow-md backdrop-blur-sm hover:bg-black/75 aria-expanded:bg-black/80"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="currentColor">
          <circle cx="9" cy="3.5" r="1.6" />
          <circle cx="9" cy="9" r="1.6" />
          <circle cx="9" cy="14.5" r="1.6" />
        </svg>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-30 mt-1 w-52 origin-top-right animate-scale-in rounded-xl border border-line bg-surface p-1.5 shadow-xl shadow-black/30">
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              onClick={() => { setOpen(false); item.onSelect(); }}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-mist focus-visible:bg-mist ${item.danger ? 'text-danger' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
