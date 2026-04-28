/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#16213e',
        'secondary': '#1a1a2e',
        'accent': '#4a4a6a',
        'highlight': '#ff79c6',
        'success': '#50fa7b',
        'warning': '#f1fa8c',
        'error': '#ff5555',
      },
    },
  },
  plugins: [],
}
