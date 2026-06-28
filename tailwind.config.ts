import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta dark de DESIGN.md
        primary: '#3B82F6',
        secondary: '#0F172A',
        tertiary: '#020617',
        surface: {
          DEFAULT: 'rgba(15, 23, 42, 0.6)',
          light: 'rgba(15, 23, 42, 0.4)',
        },
        border: '#1E293B',
        // Tokens semánticos de AGENTS.md
        rescate: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#B91C1C',
        },
        suministro: {
          DEFAULT: '#22C55E',
          light: '#DCFCE7',
          dark: '#15803D',
        },
        via: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#B45309',
        },
        verificado: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
          dark: '#1D4ED8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
        md: '7px',
        lg: '8px',
        xl: '11px',
        '2xl': '12px',
      },
      spacing: {
        base: '4px',
      },
      backdropBlur: {
        xs: '4px',
        sm: '12px',
        DEFAULT: '12px',
        lg: '24px',
      },
      boxShadow: {
        glass: 'rgba(59, 130, 246, 0.15) 0px 0px 20px 0px',
        glow: 'rgba(59, 130, 246, 0.8) 0px 0px 10px 0px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
