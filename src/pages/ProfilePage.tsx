import { useQuery } from '@tanstack/react-query';
import { fetchCounts } from '../api/history';
import { useAuth } from '../context/AuthContext';

const dateFmt = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });

export function ProfilePage() {
  const { user } = useAuth();
  const counts = useQuery({ queryKey: ['counts', user?.id], queryFn: fetchCounts, enabled: !!user });

  const email = user?.email ?? '';

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-4">
        <div aria-hidden className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-accent font-display text-2xl font-bold text-on-accent">
          {email.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-bold tracking-tight">{email}</h1>
          {user?.created_at && <p className="text-mute">Member since {dateFmt.format(new Date(user.created_at))}</p>}
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
    </div>
  );
}
