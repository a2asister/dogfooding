/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a56db',
        secondary: '#0e4293',
        accent: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        dark: '#1e293b',
        'dark-light': '#334155',
      },
    },
  },
  plugins: [],
}
