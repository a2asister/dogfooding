import {
  defineConfig,
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetWebFonts({
      fonts: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  theme: {
    colors: {
      baby: {
        pink: '#FFE6E8',
        blue: '#E6F3FF',
        yellow: '#FFF9E6',
        green: '#E8FFE6',
        purple: '#F3E6FF',
        powder: '#FFF5F5',
        cream: '#FFF8F0',
        mint: '#F0FFF8',
        lavender: '#F5F0FF',
        coral: '#FFEBE5',
        sky: '#E5F2FF',
      },
      text: {
        primary: '#5D5A6A',
        secondary: '#8B8899',
        light: '#B8B5C2',
      },
      bg: {
        base: '#FFFBF7',
        card: '#FFFFFF',
        hover: '#FFF8F0',
      },
      border: {
        light: '#F0ECE8',
        medium: '#E0DCD8',
      },
      accent: {
        soft: '#FFB3BA',
        warm: '#FFDAB3',
        cool: '#B3D9FF',
        fresh: '#B3E6CC',
      },
      warning: {
        soft: '#FFF3CD',
        text: '#856404',
      },
      success: {
        soft: '#D4EDDA',
        text: '#155724',
      },
      error: {
        soft: '#F8D7DA',
        text: '#721C24',
      },
    },
    borderRadius: {
      'xl': '1rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      '4xl': '2.5rem',
      'full': '9999px',
    },
    spacing: {
      '18': '4.5rem',
      '22': '5.5rem',
    },
    boxShadow: {
      'soft': '0 4px 20px rgba(0, 0, 0, 0.04)',
      'medium': '0 8px 30px rgba(0, 0, 0, 0.06)',
      'floating': '0 12px 40px rgba(0, 0, 0, 0.08)',
      'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
    animation: {
      keyframes: {
        'float': '{ 0%, 100% { transform: translateY(0px) } 50% { transform: translateY(-10px) } }',
        'bounce-soft': '{ 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }',
        'pulse-gentle': '{ 0%, 100% { opacity: 1 } 50% { opacity: 0.7 } }',
        'wiggle': '{ 0%, 100% { transform: rotate(-3deg) } 50% { transform: rotate(3deg) } }',
        'slide-up': '{ from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }',
        'fade-in': '{ from { opacity: 0 } to { opacity: 1 } }',
        'scale-in': '{ from { transform: scale(0.95); opacity: 0 } to { transform: scale(1); opacity: 1 } }',
      },
      durations: {
        'float': '3s',
        'bounce-soft': '2s',
        'pulse-gentle': '2s',
        'wiggle': '2s',
        'slide-up': '0.5s',
        'fade-in': '0.3s',
        'scale-in': '0.3s',
      },
      timingFns: {
        'float': 'ease-in-out',
        'bounce-soft': 'ease-in-out',
        'pulse-gentle': 'ease-in-out',
        'wiggle': 'ease-in-out',
      },
      counts: {
        'float': 'infinite',
        'bounce-soft': 'infinite',
        'pulse-gentle': 'infinite',
        'wiggle': 'infinite',
      },
    },
  },
  shortcuts: {
    'card-base': 'bg-bg-card rounded-3xl shadow-soft border border-border-light p-6',
    'card-hover': 'transition-all duration-300 hover:shadow-medium hover:bg-bg-hover hover:-translate-y-1',
    'btn-primary': 'bg-accent-soft text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:shadow-medium hover:-translate-y-0.5 active:translate-y-0',
    'btn-secondary': 'bg-baby-powder text-text-primary px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:shadow-soft hover:bg-baby-cream',
    'btn-ghost': 'text-text-secondary px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-baby-powder',
    'input-base': 'w-full bg-baby-cream/50 border border-border-light rounded-2xl px-4 py-3 text-text-primary placeholder-text-light focus:outline-none focus:ring-2 focus:ring-accent-soft/50 focus:border-accent-soft transition-all duration-300',
    'label-base': 'block text-text-secondary font-medium mb-2',
    'chip': 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
    'glass': 'bg-white/70 backdrop-blur-md border border-white/50',
    'animate-float': 'animate-[float_3s_ease-in-out_infinite]',
    'animate-bounce-soft': 'animate-[bounce-soft_2s_ease-in-out_infinite]',
    'animate-pulse-gentle': 'animate-[pulse-gentle_2s_ease-in-out_infinite]',
    'animate-wiggle': 'animate-[wiggle_2s_ease-in-out_infinite]',
    'animate-slide-up': 'animate-[slide-up_0.5s_ease-out]',
    'animate-fade-in': 'animate-[fade-in_0.3s_ease-out]',
    'animate-scale-in': 'animate-[scale-in_0.3s_ease-out]',
  },
})
