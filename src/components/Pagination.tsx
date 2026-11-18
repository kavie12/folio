interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** 1 … 4 5 6 … 20 */
function pageList(page: number, total: number): (number | 'gap')[] {
  const pages = [...new Set([1, page - 1, page, page + 1, total])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const go = (p: number) => {
    onChange(p);
    window.scrollTo({ top: 0 });
  };
  const base = 'min-w-[2.25rem] rounded-md border px-3 py-1.5 text-sm font-medium';
  const idle = 'border-line text-mute hover:bg-mist hover:text-ink';

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      <button onClick={() => go(page - 1)} disabled={page <= 1} className={`${base} ${idle} disabled:opacity-40 disabled:hover:bg-transparent`}>
        Previous
      </button>
      {pageList(page, totalPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} aria-hidden className="px-1 text-mute">…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={`${base} ${p === page ? 'border-ink bg-ink text-paper' : idle}`}
          >
            {p}
          </button>
        ),
      )}
      <button onClick={() => go(page + 1)} disabled={page >= totalPages} className={`${base} ${idle} disabled:opacity-40 disabled:hover:bg-transparent`}>
        Next
      </button>
    </nav>
  );
}
