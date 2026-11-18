import type { ReactNode } from 'react';
import { GRID_CLASS } from './grid';

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-mute">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

const shimmer = 'animate-shimmer bg-gradient-to-r from-mist via-line to-mist bg-[length:200%_100%]';

/** Placeholder poster grid shown while a page of results loads. */
export function GridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div role="status">
      <span className="sr-only">Loading</span>
      <ul aria-hidden className={GRID_CLASS}>
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="space-y-2">
            <div className={`aspect-[2/3] rounded-lg ${shimmer}`} />
            <div className={`h-3 w-4/5 rounded ${shimmer}`} />
            <div className={`h-3 w-1/2 rounded ${shimmer}`} />
            <div className={`h-9 rounded-md ${shimmer}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-md animate-fade-up py-16 text-center">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {children && <p className="mt-2 text-mute">{children}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-md animate-fade-up py-16 text-center">
      <h2 className="font-display text-xl font-semibold text-danger">Something went wrong</h2>
      <p className="mt-2 text-mute">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 rounded-md border border-ink px-4 py-2 text-sm font-medium hover:bg-mist">
          Try again
        </button>
      )}
    </div>
  );
}
