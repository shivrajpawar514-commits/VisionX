import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#070A0F',
        panel: '#0B1017',
        raised: '#111723',
        card: '#161F2E',
        line: '#1E293B',
        'line-bright': '#334155',
        muted: '#64748B',
        'muted-bright': '#94A3B8',
        ink: '#F8FAFC',
        live: '#10B981',
        cyber: '#06B6D4',
        ai: '#8B5CF6',
        alert: '#EF4444',
        warn: '#F59E0B',
        data: '#38BDF8',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        'glow-live': '0 0 20px -3px rgba(16, 185, 129, 0.3)',
        'glow-cyber': '0 0 20px -3px rgba(6, 182, 212, 0.3)',
        'glow-ai': '0 0 20px -3px rgba(139, 92, 246, 0.3)',
        'glow-alert': '0 0 20px -3px rgba(239, 68, 68, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.98)' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config

