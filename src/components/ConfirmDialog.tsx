import { Modal } from './Modal';

interface Props {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, body, confirmLabel, onConfirm, onCancel }: Props) {
  return (
    <Modal labelledBy="confirm-title" onClose={onCancel}>
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
    </Modal>
  );
}
