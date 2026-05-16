import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import { useUserStore } from '@/stores/user'
import { describe, beforeEach, it, expect, vi } from 'vitest'
import axios from 'axios'

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      post: vi.fn(),
      get: vi.fn(),
    })),
  },
}))

describe('Login.vue', () => {
  let router: any
  let mockAxios: any

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/login', component: Login },
      ],
    })

    mockAxios = {
      post: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    }
    vi.spyOn(axios, 'create').mockReturnValue(mockAxios)
  })

  it('should render login form correctly', () => {
    const wrapper = mount(Login, {
      global: { plugins: [router] },
    })
    expect(wrapper.find('.login-title').text()).toBe('登录')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('.login-btn').text()).toBe('登录')
    expect(wrapper.find('router-link').attributes('to')).toBe('/register')
  })

  it('should show alert when username is empty', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const wrapper = mount(Login, {
      global: { plugins: [router] },
    })
    
    await wrapper.find('.login-btn').trigger('click')
    
    expect(alertSpy).toHaveBeenCalledWith('请输入用户名和密码')
    alertSpy.mockRestore()
  })

  it('should show alert when password is empty', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const wrapper = mount(Login, {
      global: { plugins: [router] },
    })
    
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('.login-btn').trigger('click')
    
    expect(alertSpy).toHaveBeenCalledWith('请输入用户名和密码')
    alertSpy.mockRestore()
  })

  it('should handle successful login', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const userStore = useUserStore()
    
    mockAxios.post.mockResolvedValue({
      data: {
        code: 200,
        data: {
          token: 'test-token',
          user: { id: 1, username: 'testuser' },
        },
      },
    })

    const wrapper = mount(Login, {
      global: { plugins: [router] },
    })
    
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('.login-btn').trigger('click')

    expect(mockAxios.post).toHaveBeenCalledWith('/login', {
      username: 'testuser',
      password: 'password123',
    })
    
    expect(userStore.token).toBe('test-token')
    expect(userStore.user).toEqual({ id: 1, username: 'testuser' })
    alertSpy.mockRestore()
  })

  it('should handle login failure', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    mockAxios.post.mockResolvedValue({
      data: {
        code: 400,
        message: '用户名或密码错误',
      },
    })

    const wrapper = mount(Login, {
      global: { plugins: [router] },
    })
    
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('wrongpassword')
    await wrapper.find('.login-btn').trigger('click')

    expect(alertSpy).toHaveBeenCalledWith('用户名或密码错误')
    alertSpy.mockRestore()
  })

  it('should handle network error', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    mockAxios.post.mockRejectedValue(new Error('Network Error'))

    const wrapper = mount(Login, {
      global: { plugins: [router] },
    })
    
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('.login-btn').trigger('click')

    expect(alertSpy).toHaveBeenCalledWith('登录失败，请重试')
    alertSpy.mockRestore()
  })

  it('should disable button and show loading state during login', async () => {
    mockAxios.post.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    const wrapper = mount(Login, {
      global: { plugins: [router] },
    })
    
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('.login-btn').trigger('click')

    expect(wrapper.find('.login-btn').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.login-btn').text()).toBe('登录中...')
  })
})
