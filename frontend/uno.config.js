import {
  defineConfig,
  presetUno,
  presetIcons,
  presetTypography,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
    presetTypography(),
  ],
  shortcuts: {
    'btn-primary': 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer',
    'btn-secondary': 'bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer',
    'btn-danger': 'bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer',
    'card': 'bg-white rounded-xl shadow-md p-6',
    'input': 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
    'label': 'block text-sm font-medium text-gray-700 mb-1',
    'page-container': 'max-w-7xl mx-auto px-4 py-6',
    'page-title': 'text-2xl font-bold text-gray-900 mb-6',
    'status-badge': 'px-2 py-1 rounded-full text-xs font-medium',
    'status-success': 'bg-green-100 text-green-800',
    'status-warning': 'bg-yellow-100 text-yellow-800',
    'status-danger': 'bg-red-100 text-red-800',
    'status-info': 'bg-blue-100 text-blue-800',
    'status-secondary': 'bg-gray-100 text-gray-800',
  },
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
    },
  },
})
