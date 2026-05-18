import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RichEditor from './RichEditor.vue'

vi.mock('@wangeditor/editor-for-vue', () => ({
  Editor: {
    name: 'Editor',
    template: '<div class="wangeditor-editor"><slot></slot></div>',
    props: ['modelValue', 'defaultConfig', 'mode'],
    emits: ['update:modelValue', 'onCreated', 'onChange']
  },
  Toolbar: {
    name: 'Toolbar',
    template: '<div class="wangeditor-toolbar"><slot></slot></div>',
    props: ['editor', 'defaultConfig', 'mode']
  }
}))

vi.mock('@wangeditor/editor', () => ({
  IDomEditor: vi.fn()
}))

const mockUploadApi = {
  uploadImage: vi.fn().mockResolvedValue({
    url: 'https://example.com/uploaded.jpg'
  })
}

vi.mock('../api', () => ({
  uploadApi: mockUploadApi
}))

describe('RichEditor 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染编辑器', () => {
    const wrapper = mount(RichEditor, {
      props: {
        modelValue: ''
      },
      global: {
        stubs: ['Editor', 'Toolbar']
      }
    })
    expect(wrapper.find('.rich-editor-container').exists()).toBe(true)
    expect(wrapper.find('.editor-toolbar').exists()).toBe(true)
    expect(wrapper.find('.editor-content').exists()).toBe(true)
  })

  it('应该显示传入的内容', () => {
    const wrapper = mount(RichEditor, {
      props: {
        modelValue: '<p>测试内容</p>'
      },
      global: {
        stubs: ['Editor', 'Toolbar']
      }
    })
    expect(wrapper.vm.valueHtml).toBe('<p>测试内容</p>')
  })

  it('内容变化时应该触发 update:modelValue', async () => {
    const wrapper = mount(RichEditor, {
      props: {
        modelValue: ''
      },
      global: {
        stubs: ['Editor', 'Toolbar']
      }
    })
    
    const editorComponent = wrapper.findComponent({ name: 'Editor' })
    await editorComponent.vm.$emit('update:modelValue', '<p>新内容</p>')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('<p>新内容</p>')
  })

  it('外部值变化时应该更新内部值', async () => {
    const wrapper = mount(RichEditor, {
      props: {
        modelValue: ''
      },
      global: {
        stubs: ['Editor', 'Toolbar']
      }
    })
    
    await wrapper.setProps({ modelValue: '<p>更新的内容</p>' })
    
    expect(wrapper.vm.valueHtml).toBe('<p>更新的内容</p>')
  })

  it('应该有正确的工具栏配置', () => {
    const wrapper = mount(RichEditor, {
      props: {
        modelValue: ''
      },
      global: {
        stubs: ['Editor', 'Toolbar']
      }
    })
    
    expect(wrapper.vm.toolbarConfig.excludeKeys).toContain('group-video')
    expect(wrapper.vm.toolbarConfig.excludeKeys).toContain('insertVideo')
  })

  it('应该有正确的编辑器配置', () => {
    const wrapper = mount(RichEditor, {
      props: {
        modelValue: ''
      },
      global: {
        stubs: ['Editor', 'Toolbar']
      }
    })
    
    expect(wrapper.vm.editorConfig.placeholder).toBe('请输入内容...')
  })

  it('应该支持自定义 placeholder', () => {
    const wrapper = mount(RichEditor, {
      props: {
        modelValue: '',
        placeholder: '自定义提示'
      },
      global: {
        stubs: ['Editor', 'Toolbar']
      }
    })
    
    expect(wrapper.vm.editorConfig.placeholder).toBe('自定义提示')
  })
})
