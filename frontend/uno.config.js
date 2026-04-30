import { defineConfig, presetUno, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/'
    })
  ],
  shortcuts: {
    'btn': 'px-4 py-2 rounded font-medium transition-colors',
    'btn-primary': 'bg-blue-500 text-white hover:bg-blue-600',
    'btn-secondary': 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    'btn-danger': 'bg-red-500 text-white hover:bg-red-600',
    'card': 'bg-white rounded-lg shadow-md p-4',
    'input': 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
    'label': 'block text-sm font-medium text-gray-700 mb-1'
  },
  theme: {
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444'
    }
  }
})
