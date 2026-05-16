import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Toast from '@/components/Toast.vue'
import { useUserStore } from '@/stores/user'
import { describe, beforeEach, it, expect, vi } from 'vitest'

describe('Toast.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render correctly with no toasts', () => {
    const wrapper = mount(Toast)
    expect(wrapper.find('.toast-container').exists()).toBe(true)
    expect(wrapper.findAll('.toast-item').length).toBe(0)
  })

  it('should render success toast', () => {
    const userStore = useUserStore()
    userStore.showToast('success', 'Success message')
    
    const wrapper = mount(Toast)
    const toast = wrapper.find('.toast-item')
    expect(toast.exists()).toBe(true)
    expect(toast.classes()).toContain('toast-success')
    expect(toast.text()).toBe('Success message')
  })

  it('should render error toast', () => {
    const userStore = useUserStore()
    userStore.showToast('error', 'Error message')
    
    const wrapper = mount(Toast)
    const toast = wrapper.find('.toast-item')
    expect(toast.classes()).toContain('toast-error')
    expect(toast.text()).toBe('Error message')
  })

  it('should render warning toast', () => {
    const userStore = useUserStore()
    userStore.showToast('warning', 'Warning message')
    
    const wrapper = mount(Toast)
    const toast = wrapper.find('.toast-item')
    expect(toast.classes()).toContain('toast-warning')
    expect(toast.text()).toBe('Warning message')
  })

  it('should render info toast', () => {
    const userStore = useUserStore()
    userStore.showToast('info', 'Info message')
    
    const wrapper = mount(Toast)
    const toast = wrapper.find('.toast-item')
    expect(toast.classes()).toContain('toast-info')
    expect(toast.text()).toBe('Info message')
  })

  it('should render multiple toasts', () => {
    const userStore = useUserStore()
    userStore.showToast('success', 'Success 1')
    userStore.showToast('error', 'Error 1')
    
    const wrapper = mount(Toast)
    const toasts = wrapper.findAll('.toast-item')
    expect(toasts.length).toBe(2)
    expect(toasts[0].classes()).toContain('toast-success')
    expect(toasts[1].classes()).toContain('toast-error')
  })

  it('should remove toast after 3 seconds', async () => {
    const userStore = useUserStore()
    userStore.showToast('success', 'Test message')
    
    const wrapper = mount(Toast)
    expect(wrapper.findAll('.toast-item').length).toBe(1)
    
    vi.advanceTimersByTime(3000)
    await wrapper.vm.$nextTick()
    
    expect(userStore.toasts.length).toBe(0)
  })
})
