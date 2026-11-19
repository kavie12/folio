import { useEffect, type RefObject } from 'react';

/** Calls onClose when the user clicks outside `ref` or presses Escape, while `open` is true. */
export function useDismiss(ref: RefObject<HTMLElement>, open: boolean, onClose: (reason: 'outside' | 'escape') => void) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose('outside');
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose('escape');
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, ref]);
}
