<template>
  <div class="demo-container">
    <h1>Vue 富文本编辑器组件</h1>
    
    <div class="demo-section">
      <h2>基础用法 - 局部注册</h2>
      <RichTextEditor v-model="content1" placeholder="请输入您的内容..." />
      <div class="content-preview">
        <h3>实时HTML输出：</h3>
        <pre>{{ content1 }}</pre>
      </div>
      <div class="content-render">
        <h3>渲染效果：</h3>
        <div class="render-box" v-html="content1"></div>
      </div>
    </div>

    <div class="demo-section">
      <h2>带初始内容</h2>
      <RichTextEditor v-model="content2" placeholder="继续编辑..." />
      <button @click="resetContent2" class="reset-btn">重置内容</button>
    </div>

    <div class="demo-section">
      <h2>自定义placeholder</h2>
      <RichTextEditor v-model="content3" placeholder="请在这里输入您的评论内容..." />
    </div>

    <div class="demo-section">
      <h2>外部赋值回显测试</h2>
      <div class="button-group">
        <button @click="setHtmlContent" class="action-btn">设置HTML内容</button>
        <button @click="clearContent" class="action-btn">清空内容</button>
      </div>
      <RichTextEditor v-model="content4" placeholder="点击上方按钮测试外部赋值..." />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RichTextEditor } from './components'

const content1 = ref('')
const content2 = ref('<p>这是<strong>初始</strong>内容，包含一些<a href="#">HTML</a>标签。</p>')
const content3 = ref('')
const content4 = ref('')

const resetContent2 = () => {
  content2.value = '<p>这是<strong>重置后的</strong>内容。</p>'
}

const setHtmlContent = () => {
  content4.value = `
    <h3>外部设置的标题</h3>
    <p>这是通过v-model外部赋值的内容。</p>
    <p>包含多行文本和<br>换行符。</p>
  `
}

const clearContent = () => {
  content4.value = ''
}
</script>

<style scoped>
.demo-container {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 40px;
  font-size: 28px;
}

.demo-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.demo-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.demo-section h2 {
  color: #666;
  margin-bottom: 16px;
  font-size: 18px;
}

.demo-section h3 {
  color: #999;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: normal;
}

.content-preview {
  margin-top: 20px;
}

.content-preview pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  color: #666;
}

.content-render {
  margin-top: 20px;
}

.render-box {
  border: 1px dashed #ddd;
  padding: 12px;
  border-radius: 4px;
  min-height: 60px;
}

.button-group {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.reset-btn, .action-btn {
  padding: 8px 16px;
  background: #4096ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 12px;
  transition: background 0.3s;
}

.reset-btn:hover, .action-btn:hover {
  background: #69b1ff;
}

.button-group .action-btn {
  margin-top: 0;
}
</style>
