import { defineConfig } from 'unocss';
import { presetUno, presetAttributify, presetIcons } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons()
  ],
  shortcuts: {
    'card': 'bg-white rounded-lg shadow-md p-4',
    'btn': 'px-4 py-2 rounded-md font-medium transition-colors',
    'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600',
    'btn-secondary': 'btn bg-gray-200 text-gray-800 hover:bg-gray-300',
    'btn-danger': 'btn bg-red-500 text-white hover:bg-red-600',
    'input': 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
  }
});
