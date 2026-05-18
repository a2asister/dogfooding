import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BannerCarousel from './BannerCarousel.vue'
import type { Banner } from '../types'

vi.useFakeTimers()

vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    template: '<a class="router-link"><slot></slot></a>'
  }
}))

const mockBanners: Banner[] = [
  { id: 1, image: 'https://example.com/banner1.jpg', title: 'Banner 1', link: '/link1' },
  { id: 2, image: 'https://example.com/banner2.jpg', title: 'Banner 2', link: '/link2' },
  { id: 3, image: 'https://example.com/banner3.jpg', title: 'Banner 3', link: '/link3' }
]

describe('BannerCarousel 组件', () => {
  beforeEach(() => {
    vi.clearAllTimers()
  })

  it('应该正确渲染所有 Banner', () => {
    const wrapper = mount(BannerCarousel, {
      props: { banners: mockBanners },
      global: {
        stubs: ['RouterLink']
      }
    })
    const slides = wrapper.findAll('.banner-slide')
    expect(slides.length).toBe(3)
  })

  it('应该显示正确的 Banner 标题', () => {
    const wrapper = mount(BannerCarousel, {
      props: { banners: mockBanners },
      global: {
        stubs: ['RouterLink']
      }
    })
    expect(wrapper.text()).toContain('Banner 1')
    expect(wrapper.text()).toContain('Banner 2')
    expect(wrapper.text()).toContain('Banner 3')
  })

  it('应该渲染指示器', () => {
    const wrapper = mount(BannerCarousel, {
      props: { banners: mockBanners },
      global: {
        stubs: ['RouterLink']
      }
    })
    const indicators = wrapper.findAll('.banner-indicators span')
    expect(indicators.length).toBe(3)
  })

  it('应该有左右箭头按钮', () => {
    const wrapper = mount(BannerCarousel, {
      props: { banners: mockBanners },
      global: {
        stubs: ['RouterLink']
      }
    })
    expect(wrapper.find('.banner-arrow.prev').exists()).toBe(true)
    expect(wrapper.find('.banner-arrow.next').exists()).toBe(true)
  })

  it('点击下一张应该切换到下一张', async () => {
    const wrapper = mount(BannerCarousel, {
      props: { banners: mockBanners },
      global: {
        stubs: ['RouterLink']
      }
    })
    expect(wrapper.vm.currentIndex).toBe(0)
    await wrapper.find('.banner-arrow.next').trigger('click')
    expect(wrapper.vm.currentIndex).toBe(1)
  })

  it('点击上一张应该切换到上一张', async () => {
    const wrapper = mount(BannerCarousel, {
      props: { banners: mockBanners },
      global: {
        stubs: ['RouterLink']
      }
    })
    expect(wrapper.vm.currentIndex).toBe(0)
    await wrapper.find('.banner-arrow.prev').trigger('click')
    expect(wrapper.vm.currentIndex).toBe(2)
  })

  it('点击指示器应该跳转到对应 Banner', async () => {
    const wrapper = mount(BannerCarousel, {
      props: { banners: mockBanners },
      global: {
        stubs: ['RouterLink']
      }
    })
    const indicators = wrapper.findAll('.banner-indicators span')
    await indicators[2].trigger('click')
    expect(wrapper.vm.currentIndex).toBe(2)
  })

  it('到最后一张后点击下一张应该回到第一张', async () => {
    const wrapper = mount(BannerCarousel, {
      props: { banners: mockBanners },
      global: {
        stubs: ['RouterLink']
      }
    })
    wrapper.vm.currentIndex = 2
    await wrapper.find('.banner-arrow.next').trigger('click')
    expect(wrapper.vm.currentIndex).toBe(0)
  })

  it('应该自动轮播', () => {
    const wrapper = mount(BannerCarousel, {
      props: { banners: mockBanners },
      global: {
        stubs: ['RouterLink']
      }
    })
    expect(wrapper.vm.currentIndex).toBe(0)
    vi.advanceTimersByTime(5000)
    expect(wrapper.vm.currentIndex).toBe(1)
  })

  it('组件卸载时应该清除定时器', () => {
    const wrapper = mount(BannerCarousel, {
      props: { banners: mockBanners },
      global: {
        stubs: ['RouterLink']
      }
    })
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    wrapper.unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
