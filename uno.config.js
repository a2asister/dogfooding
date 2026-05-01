import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno()
  ],
  shortcuts: {
    'btn': 'px-4 py-2 rounded-lg font-medium transition-all duration-200',
    'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600',
    'btn-secondary': 'btn bg-gray-200 text-gray-700 hover:bg-gray-300',
    'card': 'bg-white rounded-xl shadow-md p-6',
    'input': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'link': 'text-blue-500 hover:text-blue-700 cursor-pointer'
  }
})
