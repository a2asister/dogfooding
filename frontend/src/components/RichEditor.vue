<template>
  <div class="rich-editor-container">
    <Toolbar
      class="editor-toolbar"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      mode="default"
    />
    <Editor
      class="editor-content"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      mode="default"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onBeforeUnmount, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'
import { uploadApi } from '@/api'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  height?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = shallowRef<IDomEditor | null>(null)
const valueHtml = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  if (newVal !== valueHtml.value) {
    valueHtml.value = newVal
  }
})

const toolbarConfig = {
  excludeKeys: [
    'group-video',
    'insertVideo',
    'uploadVideo',
    'fullScreen'
  ]
}

const editorConfig = {
  placeholder: props.placeholder || '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      async customUpload(file: File, insertFn: (url: string, alt?: string, href?: string) => void) {
        try {
          const res = await uploadApi.uploadImage(file)
          if (res && res.url) {
            insertFn(res.url, file.name, res.url)
          }
        } catch (err) {
          console.error('图片上传失败:', err)
        }
      }
    }
  }
}

const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor
}

const handleChange = () => {
  emit('update:modelValue', valueHtml.value)
}

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) {
    editor.destroy()
  }
})
</script>

<style scoped lang="scss">
.rich-editor-container {
  border: 1px solid #2d4a6b;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(10, 25, 47, 0.8);

  :deep(.w-e-toolbar) {
    background: rgba(20, 40, 70, 0.9);
    border-bottom: 1px solid #2d4a6b;
    color: #e6f1ff;
  }

  :deep(.w-e-text-container) {
    background: rgba(10, 25, 47, 0.8);
    color: #e6f1ff;

    [data-slate-editor] {
      min-height: 300px;
      color: #e6f1ff;

      p, h1, h2, h3, h4, h5, h6, li, blockquote {
        color: #e6f1ff;
      }

      a {
        color: #00f5ff;
      }
    }
  }
}

.editor-toolbar {
  border-bottom: 1px solid #2d4a6b;
}

.editor-content {
  height: v-bind('height || "400px"');
  overflow-y: auto;
}
</style>
