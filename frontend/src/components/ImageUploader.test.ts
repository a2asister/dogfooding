import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ImageUploader from './ImageUploader.vue'

vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

vi.mock('@element-plus/icons-vue', () => ({
  Edit: { name: 'Edit', template: '<span>Edit</span>' },
  Plus: { name: 'Plus', template: '<span>Plus</span>' }
}))

describe('ImageUploader 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('没有值时应该显示上传占位符', () => {
    const wrapper = mount(ImageUploader, {
      props: {
        modelValue: ''
      },
      global: {
        stubs: {
          'el-upload': {
            template: '<div class="el-upload"><slot></slot></div>'
          },
          'el-icon': {
            template: '<span class="el-icon"><slot></slot></span>'
          },
          'el-button': {
            template: '<button class="el-button"><slot></slot></button>'
          }
        }
      }
    })
    expect(wrapper.find('.upload-placeholder').exists()).toBe(true)
    expect(wrapper.text()).toContain('点击上传')
  })

  it('有值时应该显示图片预览', () => {
    const wrapper = mount(ImageUploader, {
      props: {
        modelValue: 'https://example.com/image.jpg'
      },
      global: {
        stubs: {
          'el-upload': {
            template: '<div class="el-upload"><slot></slot></div>'
          },
          'el-icon': {
            template: '<span class="el-icon"><slot></slot></span>'
          },
          'el-button': {
            template: '<button class="el-button"><slot></slot></button>'
          }
        }
      }
    })
    expect(wrapper.find('.image-preview').exists()).toBe(true)
  })

  it('上传成功时应该触发 update:modelValue', async () => {
    const wrapper = mount(ImageUploader, {
      props: {
        modelValue: ''
      },
      global: {
        stubs: {
          'el-upload': {
            template: '<div class="el-upload"><slot></slot></div>'
          },
          'el-icon': {
            template: '<span class="el-icon"><slot></slot></span>'
          },
          'el-button': {
            template: '<button class="el-button"><slot></slot></button>'
          }
        }
      }
    })
    
    await wrapper.vm.handleSuccess({
      code: 0,
      data: { url: 'https://example.com/uploaded.jpg' }
    })
    
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('https://example.com/uploaded.jpg')
  })

  it('上传失败时应该显示错误信息', async () => {
    const { ElMessage } = await import('element-plus')
    const wrapper = mount(ImageUploader, {
      props: {
        modelValue: ''
      },
      global: {
        stubs: {
          'el-upload': {
            template: '<div class="el-upload"><slot></slot></div>'
          },
          'el-icon': {
            template: '<span class="el-icon"><slot></slot></span>'
          },
          'el-button': {
            template: '<button class="el-button"><slot></slot></button>'
          }
        }
      }
    })
    
    await wrapper.vm.handleSuccess({
      code: 1,
      message: '上传失败'
    })
    
    expect(ElMessage.error).toHaveBeenCalledWith('上传失败')
  })

  it('点击删除应该清空值', async () => {
    const wrapper = mount(ImageUploader, {
      props: {
        modelValue: 'https://example.com/image.jpg'
      },
      global: {
        stubs: {
          'el-upload': {
            template: '<div class="el-upload"><slot></slot></div>'
          },
          'el-icon': {
            template: '<span class="el-icon"><slot></slot></span>'
          },
          'el-button': {
            template: '<button class="el-button"><slot></slot></button>'
          }
        }
      }
    })
    
    await wrapper.find('.image-actions .el-button').trigger('click')
    
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('')
  })

  it('应该有正确的HTML结构', () => {
    const wrapper = mount(ImageUploader, {
      props: {
        modelValue: ''
      },
      global: {
        stubs: {
          'el-upload': {
            template: '<div class="el-upload"><slot></slot></div>'
          },
          'el-icon': {
            template: '<span class="el-icon"><slot></slot></span>'
          },
          'el-button': {
            template: '<button class="el-button"><slot></slot></button>'
          }
        }
      }
    })
    expect(wrapper.find('.image-uploader').exists()).toBe(true)
  })
})
