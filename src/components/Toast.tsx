import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

type Kind = 'success' | 'error';
interface ToastItem { id: number; message: string; kind: Kind }
interface ToastApi { show: (message: string, kind?: Kind) => void }

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const show = useCallback((message: string, kind: Kind = 'success') => {
    const id = nextId.current++;
    setToasts((t) => [...t.slice(-2), { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex animate-toast-in items-center gap-2 rounded-lg border bg-surface px-4 py-2.5 text-sm font-medium shadow-lg shadow-black/30 ${
              t.kind === 'error' ? 'border-danger/50 text-danger' : 'border-line text-ink'
            }`}
          >
            <span aria-hidden className={`h-2 w-2 rounded-full ${t.kind === 'error' ? 'bg-danger' : 'bg-accent'}`} />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
