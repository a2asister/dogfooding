/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'water-blue': '#1e88e5',
        'water-light': '#42a5f5',
        'water-dark': '#1565c0',
        'nature-green': '#43a047',
        'nature-light': '#66bb6a',
        'warning-amber': '#ffb300',
        'danger-red': '#e53935',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'water-flow': 'waterFlow 1.5s ease-in-out infinite',
      },
      keyframes: {
        waterFlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
}
