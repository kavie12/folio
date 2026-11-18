import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCounts } from '../api/history';
import { updateProfile, type Profile } from '../api/profile';
import { ErrorState, Spinner } from '../components/States';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { normalizeUsername, validateDisplayName, validateUsername } from '../lib/validation';

const dateFmt = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
const field = 'mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:border-accent';

export function ProfilePage() {
  const { user } = useAuth();
  const profile = useProfile();
  const counts = useQuery({ queryKey: ['counts', user?.id], queryFn: fetchCounts, enabled: !!user });

  if (profile.isPending) return <Spinner label="Loading your profile" />;
  if (profile.isError) return <ErrorState message={profile.error.message} onRetry={() => profile.refetch()} />;
  if (!profile.data) return <ErrorState message="No profile was found for this account." />;

  const p = profile.data;

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-4">
        <div aria-hidden className="grid h-16 w-16 place-items-center rounded-full bg-accent font-display text-2xl font-bold text-onaccent">
          {p.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl font-bold tracking-tight">{p.displayName}</h1>
          <p className="text-mute">@{p.username}</p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-line bg-surface p-4">
          <dt className="text-sm text-mute">Movies watched</dt>
          <dd className="mt-1 font-display text-3xl font-bold">{counts.data?.movies ?? '–'}</dd>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <dt className="text-sm text-mute">TV shows watched</dt>
          <dd className="mt-1 font-display text-3xl font-bold">{counts.data?.tv ?? '–'}</dd>
        </div>
      </dl>
      {counts.isError && <p role="alert" className="mt-2 text-sm text-danger">Couldn’t load your totals.</p>}

      <p className="mt-6 text-sm text-mute">
        {user?.email}. Member since {dateFmt.format(new Date(p.createdAt))}.
      </p>

      <ProfileForm profile={p} />
    </div>
  );
}

function ProfileForm({ profile }: { profile: Profile }) {
  const qc = useQueryClient();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [formError, setFormError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => updateProfile(profile.id, { username, displayName }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', profile.id] }),
  });

  const unchanged = displayName.trim() === profile.displayName && normalizeUsername(username) === profile.username;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = validateDisplayName(displayName) ?? validateUsername(username);
    setFormError(problem);
    if (!problem) save.mutate();
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-4 border-t border-line pt-8">
      <h2 className="font-display text-lg font-semibold">Edit profile</h2>
      <label className="block text-sm font-medium">
        Display name
        <input value={displayName} maxLength={40} onChange={(e) => { setDisplayName(e.target.value); save.reset(); }} className={field} />
      </label>
      <label className="block text-sm font-medium">
        Username
        <input value={username} maxLength={21} autoCapitalize="none" onChange={(e) => { setUsername(e.target.value); save.reset(); }} className={field} />
      </label>

      {(formError || save.isError) && (
        <p role="alert" className="text-sm text-danger">{formError ?? (save.error as Error).message}</p>
      )}
      {save.isSuccess && <p role="status" className="text-sm text-accent">Profile saved.</p>}

      <button type="submit" disabled={save.isPending || unchanged} className="rounded-md bg-accent px-4 py-2 font-medium text-onaccent hover:bg-accent-dark disabled:opacity-50">
        {save.isPending ? 'Saving' : 'Save changes'}
      </button>
    </form>
  );
}
