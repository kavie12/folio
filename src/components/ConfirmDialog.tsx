import { useEffect, useRef } from 'react';

interface Props {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Modal confirmation on the native <dialog>: focus trap, Escape and backdrop come built in. Render it only while open. */
export function ConfirmDialog({ title, body, confirmLabel, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(e) => { e.preventDefault(); onCancel(); }} // Escape
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }} // backdrop click
      className="m-auto w-[calc(100%-2rem)] max-w-sm animate-scale-in rounded-xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <h2 id="confirm-title" className="font-display text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-mute">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button autoFocus onClick={onCancel} className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-mist">
            Cancel
          </button>
          <button onClick={onConfirm} className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-paper hover:opacity-90">
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
