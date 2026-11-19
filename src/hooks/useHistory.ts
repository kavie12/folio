import { useMemo } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addWatched, fetchHistoryPage, fetchWatchedKeys, removeWatched, updateProgress, type HistoryPage,
} from '../api/history';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { mediaKey, type HistoryFilter, type MediaItem, type TvProgress } from '../types/media';

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
 * (search results) without loading the whole history.
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
  const historyKey = ['history', user?.id];

  return useMutation({
    mutationFn: async ({ item, watched }: { item: MediaItem; watched: boolean }) => {
      if (!user) throw new Error('Not signed in');
      return watched ? removeWatched(item) : addWatched(user.id, item);
    },
    onMutate: async ({ item, watched }) => {
      await Promise.all([qc.cancelQueries({ queryKey: watchedKey }), qc.cancelQueries({ queryKey: historyKey })]);
      const watchedSnapshot = qc.getQueriesData<string[]>({ queryKey: watchedKey });
      const historySnapshot = qc.getQueriesData<HistoryPage>({ queryKey: historyKey });
      const key = mediaKey(item);

      qc.setQueriesData<string[]>({ queryKey: watchedKey }, (old = []) =>
        watched ? old.filter((k) => k !== key) : old.includes(key) ? old : [...old, key],
      );
      if (watched) {
        // Removing: drop it from any cached history page straight away.
        qc.setQueriesData<HistoryPage>({ queryKey: historyKey }, (old) =>
          old && { entries: old.entries.filter((e) => mediaKey(e) !== key), total: Math.max(0, old.total - 1) },
        );
      }
      return { watchedSnapshot, historySnapshot };
    },
    onSuccess: (_data, { watched }) => toast.show(watched ? 'Removed from history' : 'Added to history'),
    onError: (_err, _vars, ctx) => {
      ctx?.watchedSnapshot.forEach(([k, data]) => qc.setQueryData(k, data));
      ctx?.historySnapshot.forEach(([k, data]) => qc.setQueryData(k, data));
      toast.show('Couldn’t save that change. Try again.', 'error');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: watchedKey });
      qc.invalidateQueries({ queryKey: historyKey });
    },
  });
}

/** Optimistically sets (or clears) a TV show's latest watched season and episode. */
export function useUpdateProgress() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const historyKey = ['history', user?.id];

  return useMutation({
    mutationFn: ({ item, progress }: { item: MediaItem; progress: TvProgress | null }) => updateProgress(item, progress),
    onMutate: async ({ item, progress }) => {
      await qc.cancelQueries({ queryKey: historyKey });
      const snapshot = qc.getQueriesData<HistoryPage>({ queryKey: historyKey });
      qc.setQueriesData<HistoryPage>({ queryKey: historyKey }, (old) =>
        old && { ...old, entries: old.entries.map((e) => (mediaKey(e) === mediaKey(item) ? { ...e, progress } : e)) },
      );
      return { snapshot };
    },
    onSuccess: (_data, { progress }) => toast.show(progress ? 'Progress saved' : 'Progress cleared'),
    onError: (_err, _vars, ctx) => {
      ctx?.snapshot.forEach(([k, data]) => qc.setQueryData(k, data));
      toast.show('Couldn’t save your progress. Try again.', 'error');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: historyKey }),
  });
}
