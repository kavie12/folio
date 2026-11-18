import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HISTORY_PAGE_SIZE } from '../api/history';
import { MediaGrid } from '../components/MediaGrid';
import { Pagination } from '../components/Pagination';
import { SearchInput } from '../components/SearchInput';
import { SegmentedControl } from '../components/SegmentedControl';
import { EmptyState, ErrorState, GridSkeleton } from '../components/States';
import { useDebounced } from '../hooks/useDebounced';
import { useHistoryPage } from '../hooks/useHistory';
import type { HistoryFilter } from '../types/media';

const FILTERS: { id: HistoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'movie', label: 'Movies' },
  { id: 'tv', label: 'TV shows' },
];

export function HistoryPage() {
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [page, setPage] = useState(1);
  const [input, setInput] = useState('');
  const term = useDebounced(input.trim(), 300);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useHistoryPage(filter, page, term);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE));

  // If removals leave the current page past the end, step back to the last page.
  useEffect(() => {
    if (data && !isPlaceholderData && page > totalPages) setPage(totalPages);
  }, [data, isPlaceholderData, page, totalPages]);

  const changeFilter = (next: HistoryFilter) => {
    setFilter(next);
    setPage(1);
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">History</h1>
          {data && total > 0 && (
            <p className="mt-1 text-sm text-mute">
              {term
                ? `${total} ${total === 1 ? 'result' : 'results'} for “${term}”`
                : `${total} ${total === 1 ? 'title' : 'titles'}, newest first`}
            </p>
          )}
        </div>
        <SegmentedControl label="Filter history" options={FILTERS} value={filter} onChange={changeFilter} />
      </div>

      <div className="mt-6 max-w-xl">
        <SearchInput
          value={input}
          onChange={(value) => {
            setInput(value);
            setPage(1);
          }}
          placeholder="Search your history"
          label="Search your history"
        />
      </div>

      <div className="mt-8">
        {isPending ? (
          <GridSkeleton />
        ) : isError ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : total === 0 && term ? (
          <EmptyState title="No matches">Nothing in your history matches “{term}”.</EmptyState>
        ) : total === 0 ? (
          <EmptyState title={filter === 'all' ? 'Nothing logged yet' : 'Nothing here yet'}>
            {filter === 'all' ? (
              <>Find something on the <Link to="/" className="text-accent underline underline-offset-4">search page</Link> and mark it as watched.</>
            ) : (
              'Titles you mark as watched in this category will appear here.'
            )}
          </EmptyState>
        ) : (
          <div aria-busy={isPlaceholderData} className={`transition-opacity duration-200 ${isPlaceholderData ? 'opacity-50' : ''}`}>
            <MediaGrid items={data.entries} />
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
