<template>
  <div class="rich-text-editor">
    <div
      ref="editorRef"
      class="editor-content"
      contenteditable="true"
      :placeholder="placeholder"
      @input="handleInput"
      @paste="handlePaste"
      @keydown="handleKeydown"
    ></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  }
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref(null)
let isComposing = false

const updateEditorContent = (content) => {
  if (editorRef.value) {
    editorRef.value.innerHTML = content || ''
  }
}

const handleInput = () => {
  if (isComposing) return
  const content = editorRef.value.innerHTML
  emit('update:modelValue', content)
}

const handlePaste = (e) => {
  e.preventDefault()
  const text = e.clipboardData.getData('text/plain')
  document.execCommand('insertText', false, text)
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    document.execCommand('insertHTML', false, '<br><br>')
  }
}

watch(() => props.modelValue, (newVal) => {
  if (editorRef.value && editorRef.value.innerHTML !== newVal) {
    updateEditorContent(newVal)
  }
})

onMounted(() => {
  nextTick(() => {
    updateEditorContent(props.modelValue)
  })
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  transition: border-color 0.3s;
}

.rich-text-editor:hover {
  border-color: #4096ff;
}

.rich-text-editor:focus-within {
  border-color: #4096ff;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.2);
}

.editor-content {
  min-height: 150px;
  padding: 12px;
  outline: none;
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  word-wrap: break-word;
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

.editor-content br {
  display: block;
  content: '';
  margin: 4px 0;
}
</style>
