/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        plant: {
          50: '#f4faf4',
          100: '#e6f3e6',
          200: '#cde6cd',
          300: '#a8d4a8',
          400: '#7cba7c',
          500: '#5aa05a',
          600: '#438543',
          700: '#366a36',
          800: '#2f572f',
          900: '#284828',
          950: '#122512'
        }
      },
      boxShadow: {
        'leaf': '0 4px 20px -4px rgba(90, 160, 90, 0.15)',
        'glow': '0 0 20px rgba(90, 160, 90, 0.4)'
      },
      backgroundImage: {
        'leaf-texture': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 50%, rgba(90,160,90,0.05) 100%)',
        'gradient-water': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-fert': 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        'gradient-prune': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
      },
      animation: {
        'glow-pulse': 'glowPulse 0.8s ease-out',
        'bounce-in': 'bounceIn 0.3s ease-out'
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(90, 160, 90, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(90, 160, 90, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(90, 160, 90, 0)' }
        },
        bounceIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
};