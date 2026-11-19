import { useEffect, useRef, type ReactNode } from 'react';

/** Modal on the native <dialog>: focus trap, Escape and backdrop come built in. Render it only while open. */
export function Modal({ labelledBy, onClose, children }: { labelledBy: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(e) => { e.preventDefault(); onClose(); }} // Escape
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} // backdrop click
      className="m-auto w-[calc(100%-2rem)] max-w-sm animate-scale-in rounded-xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">{children}</div>
    </dialog>
  );
}
