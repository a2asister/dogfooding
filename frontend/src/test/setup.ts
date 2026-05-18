import { config } from '@vue/test-utils'
import { vi } from 'vitest'

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn()
  }),
  useRoute: () => ({
    params: {},
    query: {},
    path: '/'
  }),
  RouterLink: {
    name: 'RouterLink',
    template: '<a><slot></slot></a>'
  }
}))

vi.mock('pinia', () => ({
  createPinia: () => ({}),
  defineStore: () => () => ({
    isLoggedIn: true,
    username: 'admin'
  })
}))

vi.mock('element-plus', () => {
  const components = [
    { name: 'ElButton', template: '<button><slot></slot></button>' },
    { name: 'ElInput', template: '<input />' },
    { name: 'ElForm', template: '<form><slot></slot></form>' },
    { name: 'ElFormItem', template: '<div><slot></slot></div>' },
    { name: 'ElSelect', template: '<select><slot></slot></select>' },
    { name: 'ElOption', template: '<option><slot></slot></option>' },
    { name: 'ElDialog', template: '<div><slot></slot></div>' },
    { name: 'ElTable', template: '<table><slot></slot></table>' },
    { name: 'ElTableColumn', template: '<td><slot></slot></td>' },
    { name: 'ElPagination', template: '<div></div>' },
    { name: 'ElTabs', template: '<div><slot></slot></div>' },
    { name: 'ElTabPane', template: '<div><slot></slot></div>' },
    { name: 'ElMessage', template: '<div></div>' },
    { name: 'ElMessageBox', template: '<div></div>' },
    { name: 'ElUpload', template: '<div><slot></slot></div>' },
    { name: 'ElIcon', template: '<span><slot></slot></span>' },
    { name: 'ElCard', template: '<div><slot></slot></div>' }
  ]
  
  return {
    default: {
      install: () => {}
    },
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn().mockResolvedValue(true)
    }
  }
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))
