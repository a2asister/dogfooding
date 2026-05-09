/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        text: {
          light: '#6b7280',
          DEFAULT: '#4b5563',
          dark: '#1f2937'
        },
        link: {
          light: '#93c5fd',
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8'
        },
        image: {
          light: '#fbbf24',
          DEFAULT: '#f59e0b',
          dark: '#d97706'
        }
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'hover': '0 6px 24px rgba(0, 0, 0, 0.12)',
        'floating': '0 8px 32px rgba(0, 0, 0, 0.15)'
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'checkmark': 'checkmark 0.4s ease-out',
        'pulse-soft': 'pulseSoft 1.5s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        checkmark: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        }
      }
    },
  },
  plugins: [],
}
