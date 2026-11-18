import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { searchMedia } from '../api/tmdb';
import { MediaGrid } from '../components/MediaGrid';
import { Pagination } from '../components/Pagination';
import { SearchInput } from '../components/SearchInput';
import { EmptyState, ErrorState, GridSkeleton } from '../components/States';
import { useDebounced } from '../hooks/useDebounced';

export function SearchPage() {
  const [input, setInput] = useState('');
  const [page, setPage] = useState(1);
  const term = useDebounced(input.trim());
  const searching = term.length >= 2;

  const search = useQuery({
    queryKey: ['search', term, page],
    queryFn: () => searchMedia(term, page),
    enabled: searching,
    placeholderData: keepPreviousData,
    staleTime: 300_000,
  });
  const items = search.data?.items ?? [];

  return (
    <div>
      {/* Same elements in both states, so the input keeps focus as the layout moves up. */}
      <div className={`relative mx-auto max-w-xl ${searching ? '' : 'flex min-h-[calc(100vh-12rem)] flex-col justify-center text-center'}`}>
        {!searching && (
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 animate-glow rounded-full bg-accent/10 blur-3xl" />
        )}
        {!searching && <h1 className="relative mb-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">What did you watch?</h1>}

        <SearchInput
          large
          autoFocus
          value={input}
          onChange={(value) => {
            setInput(value);
            setPage(1); // a new query always starts on page 1
          }}
          placeholder="Search movies and TV shows"
          label="Search movies and TV shows"
        />

        {!searching && <p className="relative mt-3 text-sm text-mute">Search by title, then mark it as watched.</p>}
      </div>

      {searching && (
        <section className="mt-10 animate-fade-in">
          <h2 className="mb-4 font-display text-lg font-semibold">Results for “{term}”</h2>

          {search.isPending ? (
            <GridSkeleton />
          ) : search.isError ? (
            <ErrorState message={search.error.message} onRetry={() => search.refetch()} />
          ) : items.length === 0 ? (
            <EmptyState title="No matches">Check the spelling or try a different title.</EmptyState>
          ) : (
            <div aria-busy={search.isPlaceholderData} className={`transition-opacity duration-200 ${search.isPlaceholderData ? 'opacity-50' : ''}`}>
              <MediaGrid items={items} />
              <Pagination page={page} totalPages={search.data?.totalPages ?? 1} onChange={setPage} />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
