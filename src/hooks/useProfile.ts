import { useQuery } from '@tanstack/react-query';
import { fetchProfile } from '../api/profile';
import { useAuth } from '../context/AuthContext';

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  });
}
