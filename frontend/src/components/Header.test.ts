import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Header from './Header.vue'

const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  RouterLink: {
    name: 'RouterLink',
    template: '<a class="router-link"><slot></slot></a>'
  }
}))

describe('Header 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染 Logo', () => {
    const wrapper = mount(Header, {
      global: {
        stubs: {
          RouterLink: {
            template: '<div><slot></slot></div>'
          }
        }
      }
    })
    expect(wrapper.text()).toContain('星际幻想')
  })

  it('应该渲染所有导航链接', () => {
    const wrapper = mount(Header, {
      global: {
        stubs: {
          RouterLink: {
            template: '<div class="nav-link"><slot></slot></div>'
          }
        }
      }
    })
    const navLinks = wrapper.findAll('.main-nav .nav-link')
    expect(navLinks.length).toBe(6)
    expect(wrapper.text()).toContain('首页')
    expect(wrapper.text()).toContain('游戏介绍')
    expect(wrapper.text()).toContain('新闻资讯')
    expect(wrapper.text()).toContain('活动中心')
    expect(wrapper.text()).toContain('下载游戏')
    expect(wrapper.text()).toContain('玩家服务')
  })

  it('应该在窗口大小变化时关闭移动端菜单', async () => {
    const wrapper = mount(Header, {
      global: {
        stubs: {
          RouterLink: {
            template: '<div><slot></slot></div>'
          }
        }
      }
    })
    
    window.dispatchEvent(new Event('resize'))
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.mobileMenuOpen).toBe(false)
  })

  it('应该有正确的HTML结构', () => {
    const wrapper = mount(Header, {
      global: {
        stubs: {
          RouterLink: {
            template: '<div><slot></slot></div>'
          }
        }
      }
    })
    expect(wrapper.find('.site-header').exists()).toBe(true)
    expect(wrapper.find('.logo').exists()).toBe(true)
    expect(wrapper.find('.main-nav').exists()).toBe(true)
  })
})
