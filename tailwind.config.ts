import type { Config } from 'tailwindcss';
import pseudoElements from 'tailwindcss-pseudo-elements';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: { brand: { DEFAULT: '#2563eb', dark: '#1d4ed8' } },
    },
  },
  plugins: [pseudoElements],
} satisfies Config;
