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
    'btn': 'px-4 py-2 rounded-lg font-medium transition-all duration-200',
    'btn-primary': 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
    'btn-secondary': 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
    'card': 'bg-white rounded-xl shadow-md p-6',
    'input': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'badge': 'px-2 py-1 rounded-full text-xs font-medium'
  }
})
