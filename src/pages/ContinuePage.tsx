import { ContinueCard } from '../components/ContinueCard';
import { GRID_CLASS } from '../components/grid';
import { EmptyState, ErrorState, GridSkeleton } from '../components/States';
import { useContinue } from '../hooks/useContinue';

export function ContinuePage() {
  const { data, isPending, isError, error, refetch } = useContinue();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Continue</h1>
      <p className="mt-1 max-w-xl text-sm text-mute">
        The next episode of each show you’re following, saved automatically when you open it with the Folio Tracker extension.
      </p>

      <div className="mt-8">
        {isPending ? (
          <GridSkeleton count={5} />
        ) : isError ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : data.length === 0 ? (
          <EmptyState title="Nothing to continue yet">
            Finish an episode, then open the next one on a supported site. It shows up here with a link back to it.
          </EmptyState>
        ) : (
          <ul className={GRID_CLASS}>
            {data.map((entry, i) => (
              <ContinueCard key={entry.id} entry={entry} index={i} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
