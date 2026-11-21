import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { UserMenu } from './UserMenu';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-ink text-paper' : 'text-mute hover:bg-mist hover:text-ink'}`;

export function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link to="/" aria-label="Folio home"><Logo size={30} /></Link>
            <nav className="flex gap-1" aria-label="Main">
              <NavLink to="/" end className={navClass}>Search</NavLink>
              <NavLink to="/continue" className={navClass}>Continue</NavLink>
              <NavLink to="/history" className={navClass}>History</NavLink>
            </nav>
          </div>
          <UserMenu />
        </div>
      </header>
      {/* Keyed by route so each page fades in. */}
      <main key={pathname} className="mx-auto max-w-6xl animate-fade-up px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
