import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno()
  ],
  theme: {
    colors: {
      primary: '#1890ff',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f',
      info: '#1890ff',
      dark: '#141414',
      'dark-secondary': '#1f1f1f',
      'dark-tertiary': '#262626',
      'text-primary': '#ffffff',
      'text-secondary': 'rgba(255, 255, 255, 0.85)',
      'text-tertiary': 'rgba(255, 255, 255, 0.65)',
      border: 'rgba(255, 255, 255, 0.15)',
      'glow-blue': 'rgba(24, 144, 255, 0.3)',
      'glow-green': 'rgba(82, 196, 26, 0.3)',
      'glow-red': 'rgba(255, 77, 79, 0.3)',
      'glow-yellow': 'rgba(250, 173, 20, 0.3)'
    },
    boxShadow: {
      'glow-blue': '0 0 20px rgba(24, 144, 255, 0.3)',
      'glow-green': '0 0 20px rgba(82, 196, 26, 0.3)',
      'glow-red': '0 0 20px rgba(255, 77, 79, 0.3)',
      'glow-yellow': '0 0 20px rgba(250, 173, 20, 0.3)'
    }
  },
  shortcuts: {
    'card-base': 'bg-dark-secondary border border-border rounded-lg p-4 backdrop-blur-sm',
    'card-header': 'text-text-primary text-lg font-bold mb-3 flex items-center gap-2',
    'stat-card': 'bg-dark-tertiary border border-primary/30 rounded-lg p-4 text-center shadow-glow-blue',
    'status-dot': 'w-2 h-2 rounded-full inline-block',
    'glow-border': 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent before:animate-pulse'
  }
})
