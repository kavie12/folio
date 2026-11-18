/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Colours are CSS variables (see index.css) so one class works in both themes.
      colors: {
        paper: token('paper'),
        surface: token('surface'),
        ink: token('ink'),
        accent: { DEFAULT: token('accent'), hover: token('accent-hover') },
        'on-accent': token('on-accent'),
        mute: token('mute'),
        line: token('line'),
        mist: token('mist'),
        danger: token('danger'),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(.96) translateY(-4px)' }, to: { opacity: '1', transform: 'none' } },
        pop: { '0%': { transform: 'scale(.6)', opacity: '0' }, '60%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
        'toast-in': { from: { opacity: '0', transform: 'translateY(12px) scale(.98)' }, to: { opacity: '1', transform: 'none' } },
        glow: {
          '0%, 100%': { opacity: '.7', transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1.12)' },
        },
      },
      animation: {
        'fade-in': 'fade-in .3s ease-out both',
        'fade-up': 'fade-up .4s cubic-bezier(.2,.7,.2,1) both',
        'scale-in': 'scale-in .16s ease-out both',
        pop: 'pop .3s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
        'toast-in': 'toast-in .25s ease-out both',
        glow: 'glow 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
