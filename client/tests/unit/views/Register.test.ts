import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import Register from '@/views/Register.vue'
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

describe('Register.vue', () => {
  let router: any
  let mockAxios: any

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', component: { template: '<div>Login</div>' } },
        { path: '/register', component: Register },
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

  it('should render register form correctly', () => {
    const wrapper = mount(Register, {
      global: { plugins: [router] },
    })
    expect(wrapper.find('.register-title').text()).toBe('注册')
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(3)
    expect(wrapper.find('.register-btn').text()).toBe('注册')
    expect(wrapper.find('router-link').attributes('to')).toBe('/login')
  })

  it('should show alert when username is empty', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const wrapper = mount(Register, {
      global: { plugins: [router] },
    })
    
    await wrapper.find('.register-btn').trigger('click')
    
    expect(alertSpy).toHaveBeenCalledWith('请输入用户名和密码')
    alertSpy.mockRestore()
  })

  it('should show alert when password is empty', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const wrapper = mount(Register, {
      global: { plugins: [router] },
    })
    
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('testuser')
    await wrapper.find('.register-btn').trigger('click')
    
    expect(alertSpy).toHaveBeenCalledWith('请输入用户名和密码')
    alertSpy.mockRestore()
  })

  it('should show alert when passwords do not match', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const wrapper = mount(Register, {
      global: { plugins: [router] },
    })
    
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('testuser')
    await inputs[1].setValue('password123')
    await inputs[2].setValue('password456')
    await wrapper.find('.register-btn').trigger('click')
    
    expect(alertSpy).toHaveBeenCalledWith('两次输入的密码不一致')
    alertSpy.mockRestore()
  })

  it('should handle successful registration', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    mockAxios.post.mockResolvedValue({
      data: {
        code: 200,
        message: '注册成功',
      },
    })

    const wrapper = mount(Register, {
      global: { plugins: [router] },
    })
    
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('testuser')
    await inputs[1].setValue('password123')
    await inputs[2].setValue('password123')
    await wrapper.find('.register-btn').trigger('click')

    expect(mockAxios.post).toHaveBeenCalledWith('/register', {
      username: 'testuser',
      password: 'password123',
    })
    
    expect(alertSpy).toHaveBeenCalledWith('注册成功，请登录')
    alertSpy.mockRestore()
  })

  it('should handle registration failure', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    mockAxios.post.mockResolvedValue({
      data: {
        code: 400,
        message: '用户名已存在',
      },
    })

    const wrapper = mount(Register, {
      global: { plugins: [router] },
    })
    
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('existinguser')
    await inputs[1].setValue('password123')
    await inputs[2].setValue('password123')
    await wrapper.find('.register-btn').trigger('click')

    expect(alertSpy).toHaveBeenCalledWith('用户名已存在')
    alertSpy.mockRestore()
  })

  it('should handle network error', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    mockAxios.post.mockRejectedValue(new Error('Network Error'))

    const wrapper = mount(Register, {
      global: { plugins: [router] },
    })
    
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('testuser')
    await inputs[1].setValue('password123')
    await inputs[2].setValue('password123')
    await wrapper.find('.register-btn').trigger('click')

    expect(alertSpy).toHaveBeenCalledWith('注册失败，请重试')
    alertSpy.mockRestore()
  })

  it('should disable button and show loading state during registration', async () => {
    mockAxios.post.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    const wrapper = mount(Register, {
      global: { plugins: [router] },
    })
    
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('testuser')
    await inputs[1].setValue('password123')
    await inputs[2].setValue('password123')
    await wrapper.find('.register-btn').trigger('click')

    expect(wrapper.find('.register-btn').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.register-btn').text()).toBe('注册中...')
  })
})
