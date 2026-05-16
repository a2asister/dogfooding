<template>
  <div class="demo-container">
    <h1>Vue 富文本编辑器组件 - 二期功能演示</h1>
    
    <div class="demo-section">
      <h2>1. 基础功能演示 - 完整工具栏</h2>
      <p class="desc">支持：加粗、斜体、下划线、删除线、对齐方式、列表、字体大小、文字颜色、背景色</p>
      <RichTextEditor v-model="content1" placeholder="请在此输入内容，测试工具栏功能..." :minHeight="200" />
      <div class="content-preview">
        <h3>实时HTML输出：</h3>
        <pre>{{ content1 || '(空)' }}</pre>
      </div>
      <div class="content-render">
        <h3>渲染效果：</h3>
        <div class="render-box" v-html="content1"></div>
      </div>
    </div>

    <div class="demo-section">
      <h2>2. 工具栏显示/隐藏配置</h2>
      <div class="config-row">
        <label>
          <input type="checkbox" v-model="showToolbar" />
          显示工具栏
        </label>
      </div>
      <RichTextEditor 
        v-model="content2" 
        placeholder="工具栏可根据配置显示或隐藏..."
        :showToolbar="showToolbar"
        :minHeight="150"
      />
    </div>

    <div class="demo-section">
      <h2>3. 自定义工具栏按钮顺序</h2>
      <p class="desc">可以通过 toolbarButtons 属性自定义显示哪些按钮以及显示顺序</p>
      <RichTextEditor 
        v-model="content3" 
        placeholder="只显示文字样式和列表功能..."
        :toolbarButtons="['bold', 'italic', 'underline', 'divider', 'insertOrderedList', 'insertUnorderedList']"
        :minHeight="120"
      />
      <div class="code-example">
        <code>:toolbarButtons="['bold', 'italic', 'underline', 'divider', 'insertOrderedList', 'insertUnorderedList']"</code>
      </div>
    </div>

    <div class="demo-section">
      <h2>4. 编辑区域高度自定义</h2>
      <div class="config-row">
        <label>最小高度: <input type="number" v-model.number="minH" style="width: 80px" /> px</label>
        <label>最大高度: <input type="number" v-model.number="maxH" style="width: 80px" /> px</label>
      </div>
      <RichTextEditor 
        v-model="content4" 
        placeholder="编辑区域高度可自定义，超出最大高度会出现滚动条..."
        :minHeight="minH"
        :maxHeight="maxH"
      />
    </div>

    <div class="demo-section">
      <h2>5. 粘贴过滤功能</h2>
      <div class="config-row">
        <label>
          <input type="checkbox" v-model="pastePlain" />
          纯文本粘贴模式（过滤所有HTML样式）
        </label>
      </div>
      <p class="desc">启用后粘贴会过滤外部HTML的冗余标签和样式，只保留纯文本</p>
      <RichTextEditor 
        v-model="content5" 
        placeholder="在此处粘贴内容测试过滤功能..."
        :pastePlainText="pastePlain"
        :minHeight="150"
      />
    </div>

    <div class="demo-section">
      <h2>6. 禁用状态</h2>
      <div class="config-row">
        <label>
          <input type="checkbox" v-model="isDisabled" />
          禁用编辑器
        </label>
      </div>
      <RichTextEditor 
        v-model="content6" 
        placeholder="编辑器被禁用时无法编辑..."
        :disabled="isDisabled"
        :minHeight="100"
      />
    </div>

    <div class="demo-section">
      <h2>7. 功能测试区</h2>
      <div class="button-group">
        <button @click="insertContent" class="action-btn">插入测试内容</button>
        <button @click="clearContent7" class="action-btn">清空内容</button>
        <button @click="getHtmlContent" class="action-btn">获取HTML</button>
      </div>
      <RichTextEditor 
        v-model="content7" 
        placeholder="测试选区记忆、光标保持等功能..."
        :minHeight="200"
      />
      <div v-if="htmlOutput" class="html-output-box">
        <h4>获取的HTML内容：</h4>
        <pre>{{ htmlOutput }}</pre>
      </div>
    </div>

    <div class="demo-section props-doc">
      <h2>8. Props 配置文档</h2>
      <table class="props-table">
        <thead>
          <tr>
            <th>属性名</th>
            <th>类型</th>
            <th>默认值</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prop in propsList" :key="prop.name">
            <td class="prop-name">{{ prop.name }}</td>
            <td class="prop-type">{{ prop.type }}</td>
            <td class="prop-default">{{ prop.default }}</td>
            <td class="prop-desc">{{ prop.desc }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="demo-section">
      <h2>9. 工具栏按钮名称列表</h2>
      <div class="buttons-list">
        <div v-for="btn in buttonNames" :key="btn" class="button-item">
          <code>{{ btn }}</code>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RichTextEditor } from './components'

const content1 = ref('')
const content2 = ref('这是一个可以隐藏工具栏的编辑器示例。')
const content3 = ref('')
const content4 = ref('这是一个高度可自定义的编辑器。当内容超过最大高度时，会自动出现滚动条。可以输入更多内容来测试滚动效果。')
const content5 = ref('')
const content6 = ref('这是禁用状态的内容。')
const content7 = ref('')

const showToolbar = ref(true)
const pastePlain = ref(true)
const isDisabled = ref(false)
const minH = ref(120)
const maxH = ref(300)
const htmlOutput = ref('')

const propsList = [
  { name: 'modelValue', type: 'String', default: "''", desc: '编辑器内容，支持v-model双向绑定' },
  { name: 'placeholder', type: 'String', default: "'请输入内容...'", desc: '占位提示文字' },
  { name: 'disabled', type: 'Boolean', default: 'false', desc: '是否禁用编辑器' },
  { name: 'showToolbar', type: 'Boolean', default: 'true', desc: '是否显示工具栏' },
  { name: 'toolbarButtons', type: 'Array', default: 'null', desc: '自定义工具栏按钮顺序，传入按钮名称数组' },
  { name: 'minHeight', type: 'String | Number', default: '150', desc: '编辑区域最小高度，支持px数值或CSS字符串' },
  { name: 'maxHeight', type: 'String | Number', default: 'null', desc: '编辑区域最大高度，超出显示滚动条' },
  { name: 'scrollAuto', type: 'Boolean', default: 'true', desc: '是否自动显示滚动条' },
  { name: 'pastePlainText', type: 'Boolean', default: 'true', desc: '是否启用纯文本粘贴模式，过滤HTML标签' }
]

const buttonNames = [
  'bold', 'italic', 'underline', 'strikeThrough',
  'justifyLeft', 'justifyCenter', 'justifyRight',
  'insertOrderedList', 'insertUnorderedList',
  'fontSize', 'foreColor', 'hiliteColor',
  'divider'
]

const insertContent = () => {
  content7.value = `
    <p>这是一段<strong>测试内容</strong>，用于演示编辑器功能。</p>
    <p>包含各种<em>格式</em>，如<u>下划线</u>、<s>删除线</s>等。</p>
    <p style="text-align: center;">居中文本</p>
    <ul>
      <li>无序列表项1</li>
      <li>无序列表项2</li>
    </ul>
    <ol>
      <li>有序列表项1</li>
      <li>有序列表项2</li>
    </ol>
  `
}

const clearContent7 = () => {
  content7.value = ''
}

const getHtmlContent = () => {
  htmlOutput.value = content7.value
}
</script>

<style scoped>
.demo-container {
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 50px;
  font-size: 26px;
  font-weight: 600;
}

.demo-section {
  margin-bottom: 50px;
  padding-bottom: 40px;
  border-bottom: 2px solid #f0f0f0;
}

.demo-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.demo-section h2 {
  color: #4096ff;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
}

.desc {
  color: #666;
  font-size: 13px;
  margin-bottom: 16px;
  line-height: 1.6;
}

.config-row {
  margin-bottom: 16px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.config-row label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #333;
  font-size: 14px;
}

.config-row input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.config-row input[type="number"] {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
}

.config-row input[type="number"]:focus {
  border-color: #4096ff;
}

.content-preview {
  margin-top: 20px;
}

.content-preview h3,
.content-render h3,
.html-output-box h4 {
  color: #999;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
}

.content-preview pre,
.html-output-box pre {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  color: #666;
  border: 1px solid #e8e8e8;
  max-height: 150px;
  overflow-y: auto;
}

.content-render {
  margin-top: 20px;
}

.render-box {
  border: 1px dashed #d9d9d9;
  padding: 12px;
  border-radius: 4px;
  min-height: 50px;
  background: #fafafa;
}

.code-example {
  margin-top: 12px;
  padding: 10px 14px;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 3px solid #4096ff;
}

.code-example code {
  font-size: 12px;
  color: #666;
  font-family: 'Consolas', monospace;
}

.button-group {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  background: #4096ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #69b1ff;
}

.html-output-box {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.props-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.props-table th,
.props-table td {
  padding: 12px;
  text-align: left;
  border: 1px solid #e8e8e8;
}

.props-table th {
  background: #f5f7fa;
  font-weight: 600;
  color: #333;
}

.props-table td {
  color: #666;
}

.prop-name {
  font-weight: 600;
  color: #4096ff !important;
  font-family: 'Consolas', monospace;
}

.prop-type {
  font-family: 'Consolas', monospace;
  color: #52c41a !important;
}

.prop-default {
  font-family: 'Consolas', monospace;
  color: #fa8c16 !important;
}

.buttons-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.button-item {
  padding: 6px 12px;
  background: #f0f5ff;
  border-radius: 4px;
  border: 1px solid #adc6ff;
}

.button-item code {
  color: #2f54eb;
  font-size: 12px;
  font-family: 'Consolas', monospace;
}
</style>
