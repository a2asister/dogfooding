# Vue 富文本编辑器组件 - 二期功能

基于原生JavaScript实现的轻量级Vue富文本编辑器，无需任何第三方插件，功能完整且易用。

## 功能特性

### 基础文字样式
- ✅ 加粗 (bold)
- ✅ 斜体 (italic)
- ✅ 下划线 (underline)
- ✅ 删除线 (strikeThrough)

### 段落格式
- ✅ 左对齐 (justifyLeft)
- ✅ 居中对齐 (justifyCenter)
- ✅ 右对齐 (justifyRight)

### 列表格式
- ✅ 有序列表 (insertOrderedList)
- ✅ 无序列表 (insertUnorderedList)

### 文字基础设置
- ✅ 字体大小 (fontSize) - 7个等级
- ✅ 文字颜色 (foreColor) - 颜色选择器
- ✅ 背景色 (hiliteColor) - 颜色选择器

### 高级功能
- ✅ **光标/选区管理**：解决光标错位、选中失效、频繁失焦问题
- ✅ **选区记忆**：执行格式命令后，保留用户文本选中状态
- ✅ **粘贴过滤**：支持纯文本粘贴，过滤外部HTML冗余标签、样式
- ✅ **工具栏显示/隐藏配置**
- ✅ **自定义工具栏按钮展示顺序**
- ✅ **编辑区域最小高度、最大高度自定义**
- ✅ **滚动自适应**

## Props 配置说明

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| modelValue | String | '' | 编辑器内容，支持v-model双向绑定 |
| placeholder | String | '请输入内容...' | 占位提示文字 |
| disabled | Boolean | false | 是否禁用编辑器 |
| showToolbar | Boolean | true | 是否显示工具栏 |
| toolbarButtons | Array | null | 自定义工具栏按钮顺序，传入按钮名称数组 |
| minHeight | String \| Number | 150 | 编辑区域最小高度，支持px数值或CSS字符串 |
| maxHeight | String \| Number | null | 编辑区域最大高度，超出显示滚动条 |
| scrollAuto | Boolean | true | 是否自动显示滚动条 |
| pastePlainText | Boolean | true | 是否启用纯文本粘贴模式，过滤HTML标签 |

## Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | content | 内容变化时触发，用于v-model |
| change | content | 内容变化时触发 |
| focus | - | 编辑器获得焦点时触发 |
| blur | - | 编辑器失去焦点时触发 |

## 工具栏按钮名称

可用于 `toolbarButtons` 配置的按钮名称：

| 按钮名称 | 说明 |
|----------|------|
| bold | 加粗 |
| italic | 斜体 |
| underline | 下划线 |
| strikeThrough | 删除线 |
| justifyLeft | 左对齐 |
| justifyCenter | 居中对齐 |
| justifyRight | 右对齐 |
| insertOrderedList | 有序列表 |
| insertUnorderedList | 无序列表 |
| fontSize | 字体大小选择器 |
| foreColor | 文字颜色选择器 |
| hiliteColor | 背景色选择器 |
| divider | 分隔线 |

## 基础使用

```vue
<template>
  <RichTextEditor v-model="content" placeholder="请输入内容..." />
</template>

<script setup>
import { ref } from 'vue'
import { RichTextEditor } from './components'

const content = ref('')
</script>
```

## 配置示例

### 1. 隐藏工具栏
```vue
<RichTextEditor v-model="content" :showToolbar="false" />
```

### 2. 自定义工具栏按钮顺序
```vue
<RichTextEditor 
  v-model="content" 
  :toolbarButtons="[
    'bold', 
    'italic', 
    'underline', 
    'divider', 
    'justifyLeft', 
    'justifyCenter', 
    'justifyRight'
  ]"
/>
```

### 3. 自定义编辑区域高度
```vue
<RichTextEditor 
  v-model="content" 
  :minHeight="200" 
  :maxHeight="500"
/>
```

### 4. 禁用HTML过滤，保留格式
```vue
<RichTextEditor 
  v-model="content" 
  :pastePlainText="false"
/>
```

### 5. 禁用编辑器
```vue
<RichTextEditor 
  v-model="content" 
  :disabled="true"
/>
```

## 完整示例

```vue
<template>
  <div class="editor-wrapper">
    <RichTextEditor
      v-model="content"
      placeholder="请输入文章内容..."
      :minHeight="300"
      :maxHeight="600"
      :showToolbar="showToolbar"
      :pastePlainText="true"
      :toolbarButtons="[
        'bold', 'italic', 'underline', 'strikeThrough',
        'divider',
        'justifyLeft', 'justifyCenter', 'justifyRight',
        'divider',
        'insertOrderedList', 'insertUnorderedList',
        'divider',
        'fontSize',
        'divider',
        'foreColor', 'hiliteColor'
      ]"
      @change="handleChange"
    />
    
    <div class="html-preview">
      <h4>HTML 输出：</h4>
      <pre>{{ content }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RichTextEditor } from './components'

const content = ref('')
const showToolbar = ref(true)

const handleChange = (newContent) => {
  console.log('内容已更新:', newContent)
}
</script>
```

## 技术实现说明

### 光标与选区管理
组件通过监听 `selectionchange` 事件实时保存当前选区状态，在执行格式命令前恢复选区，确保光标不会丢失或错位。

```javascript
// 保存选区
const saveSelection = () => {
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    savedSelection = selection.getRangeAt(0).cloneRange()
  }
}

// 恢复选区
const restoreSelection = () => {
  if (savedSelection) {
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(savedSelection)
    editorRef.value.focus()
  }
}
```

### 粘贴过滤机制
粘贴时会过滤掉不允许的HTML标签和属性，只保留基础格式，避免外部样式污染编辑器内容。

```javascript
const allowedTags = ['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE',
                     'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
                     'SPAN', 'DIV', 'A']
```

### 工具栏按钮激活状态
通过 `document.queryCommandState()` 实时检测当前光标所在位置的格式状态，自动高亮对应的工具栏按钮。

## 浏览器兼容性

- ✅ Chrome / Edge
- ✅ Firefox
- ✅ Safari
- ✅ 现代浏览器

## 开发与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
dogfooding3/
├── src/
│   ├── components/
│   │   ├── RichTextEditor.vue    # 富文本编辑器组件
│   │   └── index.js              # 组件导出
│   ├── App.vue                   # Demo展示页面
│   ├── main.js                   # 入口文件
│   └── style.css                 # 全局样式
├── index.html
├── package.json
├── vite.config.js
└── README.md                     # 本文档
```
