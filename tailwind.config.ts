import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0B1414',
        panel: '#121C1C',
        raised: '#182626',
        line: '#24403D',
        muted: '#7A9490',
        ink: '#E8F0EE',
        live: '#3DDC97',
        alert: '#FF6B4A',
        warn: '#F5B942',
        data: '#5EEAD4',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '4px',
      },
    },
  },
  plugins: [],
} satisfies Config
