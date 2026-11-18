interface Option<T extends string> { id: T; label: string }

interface Props<T extends string> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Equal-width segments with a sliding highlight. */
export function SegmentedControl<T extends string>({ label, options, value, onChange }: Props<T>) {
  const index = Math.max(0, options.findIndex((o) => o.id === value));

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="relative inline-grid rounded-lg border border-line bg-surface p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-md bg-ink transition-transform duration-300 ease-out"
        style={{ width: `calc((100% - 0.5rem) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={o.id === value}
          onClick={() => onChange(o.id)}
          className={`relative z-10 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            o.id === value ? 'text-paper' : 'text-mute hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
