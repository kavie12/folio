import { useId } from 'react';

/** Folio mark: fanned pages, a gold front page with a folded corner and a cut-out F, and a "watched" check. Mirrors public/favicon.svg. */
export function LogoMark({ size = 32 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id={`${id}t`} x1="8" y1="0" x2="56" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3D332C" />
          <stop offset="1" stopColor="#171311" />
        </linearGradient>
        <linearGradient id={`${id}p`} x1="18" y1="11" x2="46" y2="53" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F6D08F" />
          <stop offset="1" stopColor="#D9923B" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${id}t)`} />
      <rect x=".75" y=".75" width="62.5" height="62.5" rx="14.25" fill="none" stroke="#E3A857" strokeOpacity=".3" strokeWidth="1.5" />
      <rect x="18" y="11" width="28" height="42" rx="4" transform="rotate(17 32 32)" fill="#E3A857" fillOpacity=".22" />
      <rect x="18" y="11" width="28" height="42" rx="4" transform="rotate(8.5 32 32)" fill="#E3A857" fillOpacity=".45" />
      <path d="M22 11H37L46 20V49A4 4 0 0 1 42 53H22A4 4 0 0 1 18 49V15A4 4 0 0 1 22 11Z" fill={`url(#${id}p)`} />
      <path d="M37 11V20H46Z" fill="#9A5E1B" />
      <path d="M25 24H39V28.5H30V33H37V37.5H30V44H25Z" fill="#1B1613" />
      <circle cx="46" cy="46" r="8" fill="#1B1613" />
      <circle cx="46" cy="46" r="5.75" fill="#E3A857" />
      <path d="M43.1 46.2L45.2 48.3L49 43.9" fill="none" stroke="#1B1613" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span className="font-display font-bold tracking-tight" style={{ fontSize: size * 0.75 }}>Folio</span>
    </span>
  );
}
