import { useMemo } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addWatched, fetchHistoryPage, fetchWatchedKeys, removeWatched } from '../api/history';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { mediaKey, type HistoryFilter, type MediaItem } from '../types/media';

/** One server-paginated page of the user's history. */
export function useHistoryPage(filter: HistoryFilter, page: number, search = '') {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['history', user?.id, filter, search, page],
    queryFn: () => fetchHistoryPage(filter, page, search),
    enabled: !!user,
    placeholderData: keepPreviousData,
  });
}

/**
 * Watched status for the titles currently on screen. Works for any list
 * (search results, trending, history) without loading the whole history.
 */
export function useWatchedKeys(items: MediaItem[]) {
  const { user } = useAuth();
  const ids = items.map(mediaKey).sort().join(',');
  const query = useQuery({
    queryKey: ['watched', user?.id, ids],
    queryFn: () => fetchWatchedKeys(items),
    enabled: !!user && items.length > 0,
    placeholderData: keepPreviousData,
  });
  const keys = useMemo(() => new Set(query.data ?? []), [query.data]);
  return { keys, ready: !query.isPending && !query.isPlaceholderData };
}

/** Optimistic add/remove with rollback on failure. */
export function useToggleWatched() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const watchedKey = ['watched', user?.id];

  return useMutation({
    mutationFn: async ({ item, watched }: { item: MediaItem; watched: boolean }) => {
      if (!user) throw new Error('Not signed in');
      return watched ? removeWatched(item) : addWatched(user.id, item);
    },
    onMutate: async ({ item, watched }) => {
      await qc.cancelQueries({ queryKey: watchedKey });
      const snapshot = qc.getQueriesData<string[]>({ queryKey: watchedKey });
      const key = mediaKey(item);
      qc.setQueriesData<string[]>({ queryKey: watchedKey }, (old = []) =>
        watched ? old.filter((k) => k !== key) : old.includes(key) ? old : [...old, key],
      );
      return { snapshot };
    },
    onSuccess: (_data, { watched }) => toast.show(watched ? 'Removed from history' : 'Added to history'),
    onError: (_err, _vars, ctx) => {
      ctx?.snapshot.forEach(([k, data]) => qc.setQueryData(k, data));
      toast.show('Couldn’t save that change. Try again.', 'error');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: watchedKey });
      qc.invalidateQueries({ queryKey: ['history', user?.id] });
    },
  });
}
