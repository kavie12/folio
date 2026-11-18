interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  large?: boolean;
  autoFocus?: boolean;
}

export function SearchInput({ value, onChange, placeholder, label, large = false, autoFocus }: Props) {
  return (
    <div className="relative">
      <svg
        aria-hidden width="20" height="20" viewBox="0 0 20 20"
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-mute ${large ? 'left-4' : 'left-3.5'}`}
      >
        <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12.8 12.8L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={`w-full rounded-xl border border-line bg-surface outline-none transition focus:border-accent ${
          large ? 'py-3.5 pl-12 pr-5 text-lg shadow-lg shadow-black/10 focus:shadow-accent/10' : 'py-2.5 pl-11 pr-4'
        }`}
      />
    </div>
  );
}
