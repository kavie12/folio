import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchContinue, removeContinue } from '../api/continue';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import type { ContinueEntry } from '../types/media';

export function useContinue() {
  const { user } = useAuth();
  return useQuery({ queryKey: ['continue', user?.id], queryFn: fetchContinue, enabled: !!user });
}

/** Removes a show from Continue straight away, rolling back if it fails. */
export function useRemoveContinue() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const key = ['continue', user?.id];

  return useMutation({
    mutationFn: (mediaId: number) => removeContinue(mediaId),
    onMutate: async (mediaId) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<ContinueEntry[]>(key);
      qc.setQueryData<ContinueEntry[]>(key, (old = []) => old.filter((e) => e.id !== mediaId));
      return { previous };
    },
    onSuccess: () => toast.show('Removed from Continue'),
    onError: (_err, _id, ctx) => {
      qc.setQueryData(key, ctx?.previous);
      toast.show('Couldn’t remove that. Try again.', 'error');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
