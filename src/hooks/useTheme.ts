import { useState } from 'react';

export type Theme = 'dark' | 'light';

/** Dark is the default (set on <html> in index.html); the choice is remembered. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );

  const setTheme = (next: Theme) => {
    document.documentElement.classList.toggle('dark', next === 'dark');
    try { localStorage.setItem('folio-theme', next); } catch { /* storage unavailable */ }
    setThemeState(next);
  };

  return { theme, setTheme };
}
