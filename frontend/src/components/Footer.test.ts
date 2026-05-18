import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Footer from './Footer.vue'

vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    template: '<a class="router-link"><slot></slot></a>'
  }
}))

describe('Footer 组件', () => {
  it('应该正确渲染 Footer', () => {
    const wrapper = mount(Footer, {
      global: {
        stubs: ['RouterLink']
      }
    })
    expect(wrapper.find('.site-footer').exists()).toBe(true)
  })

  it('应该显示版权信息', () => {
    const wrapper = mount(Footer, {
      global: {
        stubs: ['RouterLink']
      }
    })
    expect(wrapper.text()).toContain('星际幻想')
  })

  it('应该显示快速链接区域', () => {
    const wrapper = mount(Footer, {
      global: {
        stubs: ['RouterLink']
      }
    })
    expect(wrapper.text()).toContain('快速链接')
  })

  it('应该显示玩家服务区域', () => {
    const wrapper = mount(Footer, {
      global: {
        stubs: ['RouterLink']
      }
    })
    expect(wrapper.text()).toContain('玩家服务')
  })

  it('应该显示合规公示区域', () => {
    const wrapper = mount(Footer, {
      global: {
        stubs: ['RouterLink']
      }
    })
    expect(wrapper.text()).toContain('合规公示')
  })

  it('应该有正确的结构', () => {
    const wrapper = mount(Footer, {
      global: {
        stubs: ['RouterLink']
      }
    })
    expect(wrapper.find('.footer-content').exists()).toBe(true)
    expect(wrapper.find('.footer-section').exists()).toBe(true)
    expect(wrapper.find('.footer-bottom').exists()).toBe(true)
  })
})
