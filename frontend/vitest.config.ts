import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['src/components/RichEditor.test.ts'],
    css: true,
    server: {
      deps: {
        external: ['@wangeditor/editor', '@wangeditor/editor-for-vue']
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          statements: 50,
          branches: 50,
          functions: 40,
          lines: 50
        }
      },
      exclude: [
        'node_modules/',
        'src/test/',
        'src/main.ts',
        'src/App.vue',
        'src/router/index.ts',
        'src/store/useAdminStore.ts',
        '**/*.d.ts'
      ]
    }
  }
})
