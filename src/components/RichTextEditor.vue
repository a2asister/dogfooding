<template>
  <div class="rich-text-editor" :class="{ 'disabled': disabled }">
    <div v-if="showToolbar" class="editor-toolbar" ref="toolbarRef">
      <template v-for="btn in toolbarButtons" :key="btn.name">
        <div v-if="btn.type === 'divider'" class="toolbar-divider"></div>
        
        <button
          v-else-if="btn.type === 'button'"
          class="toolbar-btn"
          :class="{ active: activeStates[btn.name] }"
          :title="btn.title"
          @mousedown.prevent="execCommand(btn.command, btn.value)"
        >
          <span class="btn-icon" v-html="btn.icon"></span>
        </button>

        <div v-else-if="btn.type === 'select'" class="toolbar-select-wrapper">
          <select
            class="toolbar-select"
            :value="selectValues[btn.name] || btn.defaultValue"
            @mousedown.stop="saveSelection"
            @change="execCommand(btn.command, $event.target.value)"
          >
            <option v-for="opt in btn.options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div v-else-if="btn.type === 'color'" class="toolbar-color-wrapper">
          <button class="toolbar-btn color-btn" :title="btn.title" @mousedown.prevent>
            <span class="btn-icon" v-html="btn.icon"></span>
            <input
              type="color"
              class="color-picker"
              :value="colorValues[btn.name] || '#000000'"
              @input="execCommand(btn.command, $event.target.value)"
              @mousedown.stop="saveSelection"
            />
          </button>
        </div>
      </template>
    </div>

    <div
      ref="editorRef"
      class="editor-content"
      contenteditable
      :class="{ 'scroll-auto': scrollAuto }"
      :style="editorStyle"
      :placeholder="placeholder"
      @input="handleInput"
      @paste="handlePaste"
      @keydown="handleKeydown"
      @mouseup="updateActiveStates"
      @keyup="updateActiveStates"
      @focus="isFocused = true"
      @blur="isFocused = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showToolbar: {
    type: Boolean,
    default: true
  },
  toolbarButtons: {
    type: Array,
    default: null
  },
  minHeight: {
    type: [String, Number],
    default: 150
  },
  maxHeight: {
    type: [String, Number],
    default: null
  },
  scrollAuto: {
    type: Boolean,
    default: true
  },
  pastePlainText: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'change'])

const editorRef = ref(null)
const toolbarRef = ref(null)
const isFocused = ref(false)
const activeStates = ref({})
const selectValues = ref({})
const colorValues = ref({})

let savedSelection = null
let isComposing = false

const defaultToolbarButtons = [
  { name: 'bold', type: 'button', command: 'bold', icon: '<b>B</b>', title: '加粗' },
  { name: 'italic', type: 'button', command: 'italic', icon: '<i>I</i>', title: '斜体' },
  { name: 'underline', type: 'button', command: 'underline', icon: '<u>U</u>', title: '下划线' },
  { name: 'strikeThrough', type: 'button', command: 'strikeThrough', icon: '<s>S</s>', title: '删除线' },
  { name: 'divider1', type: 'divider' },
  { name: 'justifyLeft', type: 'button', command: 'justifyLeft', icon: '◀', title: '左对齐' },
  { name: 'justifyCenter', type: 'button', command: 'justifyCenter', icon: '■', title: '居中' },
  { name: 'justifyRight', type: 'button', command: 'justifyRight', icon: '▶', title: '右对齐' },
  { name: 'divider2', type: 'divider' },
  { name: 'insertOrderedList', type: 'button', command: 'insertOrderedList', icon: '1.', title: '有序列表' },
  { name: 'insertUnorderedList', type: 'button', command: 'insertUnorderedList', icon: '•', title: '无序列表' },
  { name: 'divider3', type: 'divider' },
  {
    name: 'fontSize',
    type: 'select',
    command: 'fontSize',
    defaultValue: '3',
    options: [
      { label: '很小', value: '1' },
      { label: '小', value: '2' },
      { label: '正常', value: '3' },
      { label: '大', value: '4' },
      { label: '很大', value: '5' },
      { label: '特大', value: '6' },
      { label: '最大', value: '7' }
    ]
  },
  { name: 'divider4', type: 'divider' },
  { name: 'foreColor', type: 'color', command: 'foreColor', icon: 'A', title: '文字颜色' },
  { name: 'hiliteColor', type: 'color', command: 'hiliteColor', icon: '▢', title: '背景色' }
]

const toolbarButtons = computed(() => {
  if (props.toolbarButtons && Array.isArray(props.toolbarButtons)) {
    return props.toolbarButtons.map(name => {
      if (name === 'divider') {
        return { type: 'divider' }
      }
      return defaultToolbarButtons.find(btn => btn.name === name) || null
    }).filter(Boolean)
  }
  return defaultToolbarButtons
})

const editorStyle = computed(() => {
  const style = {}
  if (props.minHeight) {
    style.minHeight = typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight
  }
  if (props.maxHeight) {
    style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  }
  return style
})

const saveSelection = () => {
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    savedSelection = selection.getRangeAt(0).cloneRange()
  }
}

const restoreSelection = () => {
  if (savedSelection) {
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(savedSelection)
    editorRef.value.focus()
  }
}

const execCommand = (command, value = null) => {
  restoreSelection()
  document.execCommand(command, false, value)
  updateActiveStates()
  handleInput()
  setTimeout(() => {
    editorRef.value.focus()
    saveSelection()
  }, 10)
}

const updateActiveStates = () => {
  const commands = ['bold', 'italic', 'underline', 'strikeThrough', 
                    'justifyLeft', 'justifyCenter', 'justifyRight',
                    'insertOrderedList', 'insertUnorderedList']
  
  commands.forEach(cmd => {
    activeStates.value[cmd] = document.queryCommandState(cmd)
  })
}

const updateEditorContent = (content) => {
  if (editorRef.value) {
    editorRef.value.innerHTML = content || ''
  }
}

const handleInput = () => {
  if (isComposing) return
  const content = editorRef.value.innerHTML
  emit('update:modelValue', content)
  emit('change', content)
}

const handlePaste = (e) => {
  e.preventDefault()
  
  if (props.pastePlainText) {
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  } else {
    let html = e.clipboardData.getData('text/html')
    if (html) {
      html = cleanPastedHtml(html)
      document.execCommand('insertHTML', false, html)
    } else {
      const text = e.clipboardData.getData('text/plain')
      document.execCommand('insertText', false, text)
    }
  }
  
  handleInput()
}

const cleanPastedHtml = (html) => {
  const temp = document.createElement('div')
  temp.innerHTML = html
  
  const allowedTags = ['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE',
                       'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
                       'SPAN', 'DIV', 'A']
  
  const cleanNode = (node) => {
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const child = node.childNodes[i]
      
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tagName = child.tagName.toUpperCase()
        
        if (!allowedTags.includes(tagName)) {
          const textNode = document.createTextNode(child.textContent)
          node.replaceChild(textNode, child)
          continue
        }
        
        child.removeAttribute('style')
        child.removeAttribute('class')
        child.removeAttribute('id')
        child.removeAttribute('width')
        child.removeAttribute('height')
        
        cleanNode(child)
      }
    }
  }
  
  cleanNode(temp)
  
  return temp.innerHTML
}

const handleKeydown = (e) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    document.execCommand('insertText', false, '  ')
  }
}

watch(() => props.modelValue, (newVal) => {
  if (editorRef.value && editorRef.value.innerHTML !== newVal) {
    updateEditorContent(newVal)
  }
})

watch(() => props.disabled, (newVal) => {
  if (editorRef.value) {
    editorRef.value.contentEditable = !newVal
  }
})

onMounted(() => {
  nextTick(() => {
    updateEditorContent(props.modelValue)
    if (props.disabled) {
      editorRef.value.contentEditable = false
    }
  })
  
  document.addEventListener('selectionchange', saveSelection)
})

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', saveSelection)
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  transition: border-color 0.3s, box-shadow 0.3s;
  overflow: hidden;
}

.rich-text-editor:hover {
  border-color: #4096ff;
}

.rich-text-editor:focus-within {
  border-color: #4096ff;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.2);
}

.rich-text-editor.disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 8px 12px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
  min-height: 40px;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s;
  position: relative;
}

.toolbar-btn:hover {
  background: #e6f4ff;
  color: #4096ff;
}

.toolbar-btn.active {
  background: #4096ff;
  color: #fff;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #d9d9d9;
  margin: 0 6px;
}

.toolbar-select-wrapper {
  position: relative;
}

.toolbar-select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  outline: none;
}

.toolbar-select:hover {
  border-color: #4096ff;
}

.toolbar-select:focus {
  border-color: #4096ff;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.2);
}

.toolbar-color-wrapper {
  position: relative;
}

.color-btn {
  position: relative;
  overflow: hidden;
}

.color-picker {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 4px;
  padding: 0;
  border: none;
  cursor: pointer;
  opacity: 0.8;
}

.editor-content {
  padding: 12px;
  outline: none;
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  word-wrap: break-word;
  overflow-y: auto;
}

.editor-content.scroll-auto {
  overflow-y: auto;
}

.editor-content:empty:before {
  content: attr(placeholder);
  color: #999;
  pointer-events: none;
}

.editor-content:focus {
  outline: none;
}

.editor-content * {
  margin: 0;
  padding: 0;
}

.editor-content p {
  margin: 8px 0;
}

.editor-content ul,
.editor-content ol {
  margin: 8px 0;
  padding-left: 24px;
}

.editor-content li {
  margin: 4px 0;
}

.editor-content br {
  display: block;
  content: '';
  margin: 4px 0;
}

.disabled .editor-content {
  color: #999;
  cursor: not-allowed;
}
</style>
