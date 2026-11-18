import type { WatchEntry } from '../types/media';

const HEADER = ['Title', 'Type', 'Release year', 'TMDB ID', 'Watched at'];

/** Quote when needed, and neutralise cells a spreadsheet would run as a formula. */
function cell(value: string | number | null): string {
  let s = value === null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function historyToCsv(entries: WatchEntry[]): string {
  const rows = entries.map((e) => [
    e.title,
    e.mediaType === 'movie' ? 'Movie' : 'TV show',
    e.releaseYear,
    e.id,
    e.watchedAt,
  ]);
  return [HEADER, ...rows].map((r) => r.map(cell).join(',')).join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
  // BOM so Excel reads titles as UTF-8.
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
