<template>
  <div class="editor">
    <div class="editor-header">
      <h1>贺卡编辑器</h1>
      <div class="header-actions">
        <button class="btn save-btn" @click="saveCard">保存贺卡</button>
        <button class="btn preview-btn" @click="showPreview = true">预览</button>
        <router-link to="/" class="btn back-btn">返回首页</router-link>
      </div>
    </div>

    <div class="editor-content">
      <div class="toolbar">
        <div class="tool-section">
          <h3>📝 文字内容</h3>
          <input v-model="cardData.title" placeholder="贺卡标题" class="input-field" />
          <textarea v-model="cardData.message" placeholder="贺卡祝福语" class="textarea-field" rows="4"></textarea>
          <input v-model="cardData.senderName" placeholder="发送者姓名" class="input-field" />
          <input v-model="cardData.receiverName" placeholder="接收者姓名" class="input-field" />
        </div>

        <div class="tool-section">
          <h3>🎨 背景样式</h3>
          <div class="color-picker">
            <div 
              v-for="bg in backgrounds" 
              :key="bg.id"
              class="color-option"
              :style="{ background: bg.gradient }"
              :class="{ active: cardData.background === bg.gradient }"
              @click="cardData.background = bg.gradient"
            ></div>
          </div>
        </div>

        <div class="tool-section">
          <h3>✨ 装饰元素</h3>
          <div class="decorations-grid">
            <button 
              v-for="dec in decorationOptions" 
              :key="dec.id"
              class="decoration-btn"
              @click="addDecoration(dec)"
            >
              {{ dec.emoji }}
            </button>
          </div>
          <p class="hint">点击添加到贺卡，点击卡片上的元素可删除</p>
        </div>

        <div class="tool-section">
          <h3>🎵 背景音乐</h3>
          <select v-model="cardData.music" class="select-field">
            <option value="">无音乐</option>
            <option value="happy-birthday">生日快乐</option>
            <option value="new-year">新年快乐</option>
            <option value="romantic">浪漫情人节</option>
          </select>
          <MusicVisualizer v-if="cardData.music" />
        </div>
      </div>

      <div class="preview-area">
        <Card3D ref="cardRef">
          <template #front>
            <div class="card-content front-content" :style="{ background: cardData.background }">
              <Decoration 
                v-for="(dec, index) in cardDecorations" 
                :key="index"
                :x="dec.x" 
                :y="dec.y"
                class="clickable-decoration"
                @click="removeDecoration(index)"
              >
                <span class="decoration-emoji">{{ dec.emoji }}</span>
              </Decoration>
              <AnimatedText :delay="0.3">
                <h2 class="card-title">{{ cardData.title || '节日祝福' }}</h2>
              </AnimatedText>
              <AnimatedText :delay="0.6">
                <p class="to-text">To: {{ cardData.receiverName || '亲爱的朋友' }}</p>
              </AnimatedText>
              <p class="hint-text">点击卡片翻转查看背面</p>
            </div>
          </template>
          <template #back>
            <div class="card-content back-content" :style="{ background: cardData.background }">
              <AnimatedText :delay="0.3">
                <p class="message-text">{{ cardData.message || '在这里写下你的祝福...' }}</p>
              </AnimatedText>
              <AnimatedText :delay="0.6">
                <p class="from-text">From: {{ cardData.senderName || '你的朋友' }}</p>
              </AnimatedText>
            </div>
          </template>
        </Card3D>
      </div>
    </div>

    <div v-if="showPreview" class="modal-overlay" @click="showPreview = false">
      <div class="modal-content" @click.stop>
        <h2>贺卡预览</h2>
        <div class="modal-card">
          <Card3D ref="previewCardRef">
            <template #front>
              <div class="card-content front-content" :style="{ background: cardData.background }">
                <Decoration 
                  v-for="(dec, index) in cardDecorations" 
                  :key="index"
                  :x="dec.x" 
                  :y="dec.y"
                >
                  <span class="decoration-emoji">{{ dec.emoji }}</span>
                </Decoration>
                <AnimatedText :delay="0.3">
                  <h2 class="card-title">{{ cardData.title || '节日祝福' }}</h2>
                </AnimatedText>
                <AnimatedText :delay="0.6">
                  <p class="to-text">To: {{ cardData.receiverName || '亲爱的朋友' }}</p>
                </AnimatedText>
              </div>
            </template>
            <template #back>
              <div class="card-content back-content" :style="{ background: cardData.background }">
                <AnimatedText :delay="0.3">
                  <p class="message-text">{{ cardData.message || '在这里写下你的祝福...' }}</p>
                </AnimatedText>
                <AnimatedText :delay="0.6">
                  <p class="from-text">From: {{ cardData.senderName || '你的朋友' }}</p>
                </AnimatedText>
              </div>
            </template>
          </Card3D>
        </div>
        <button class="btn close-btn" @click="showPreview = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCardStore } from '@/stores/card'
import Card3D from '@/components/Card3D.vue'
import AnimatedText from '@/components/AnimatedText.vue'
import Decoration from '@/components/Decoration.vue'
import MusicVisualizer from '@/components/MusicVisualizer.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cardStore = useCardStore()

const cardRef = ref()
const previewCardRef = ref()
const showPreview = ref(false)

interface CardData {
  title: string
  message: string
  senderName: string
  receiverName: string
  background: string
  music: string
}

interface DecorationItem {
  id: number
  emoji: string
  x: number
  y: number
}

const cardData = reactive<CardData>({
  title: '',
  message: '',
  senderName: '',
  receiverName: '',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  music: ''
})

const cardDecorations = ref<DecorationItem[]>([])

const backgrounds = [
  { id: 1, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 2, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 3, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 4, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 5, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 6, gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { id: 7, gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' },
  { id: 8, gradient: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)' },
  { id: 9, gradient: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)' }
]

const decorationOptions = [
  { id: 1, emoji: '❤️' },
  { id: 2, emoji: '⭐' },
  { id: 3, emoji: '🌸' },
  { id: 4, emoji: '🎄' },
  { id: 5, emoji: '🎁' },
  { id: 6, emoji: '🎈' },
  { id: 7, emoji: '🌟' },
  { id: 8, emoji: '💝' },
  { id: 9, emoji: '🎀' },
  { id: 10, emoji: '✨' },
  { id: 11, emoji: '🌙' },
  { id: 12, emoji: '🌹' }
]

const addDecoration = (dec: { id: number; emoji: string }): void => {
  cardDecorations.value.push({
    id: dec.id,
    emoji: dec.emoji,
    x: Math.random() * 280 + 30,
    y: Math.random() * 380 + 30
  })
}

const removeDecoration = (index: number): void => {
  cardDecorations.value.splice(index, 1)
}

const saveCard = async (): Promise<void> => {
  if (!cardData.title || !cardData.message) {
    alert('请填写贺卡标题和祝福语')
    return
  }

  try {
    const response = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...cardData,
        decorations: cardDecorations.value,
        senderId: userStore.user?.id || null
      })
    })
    
    if (response.ok) {
      const savedCard = await response.json()
      cardStore.addSentCard(savedCard)
      alert('贺卡保存成功！')
      router.push('/portfolio')
    } else {
      const error = await response.json()
      alert(error.message || '保存失败，请重试')
    }
  } catch {
    alert('保存失败，请确保后端服务已启动')
  }
}

const loadTemplate = async (): Promise<void> => {
  const templateId = route.query.templateId
  if (!templateId) return

  try {
    const response = await fetch(`/api/templates/${templateId}`)
    if (response.ok) {
      const template = await response.json()
      cardData.title = template.defaultContent.title
      cardData.message = template.defaultContent.message
      cardData.background = template.background
      cardDecorations.value = [...template.decorations]
      
      if (userStore.user) {
        cardData.senderName = userStore.user.nickname || userStore.user.username
      }
    }
  } catch {
    console.error('加载模板失败')
  }
}

onMounted(() => {
  loadTemplate()
  
  if (userStore.user) {
    cardData.senderName = userStore.user.nickname || userStore.user.username
  }
})
</script>

<style scoped>
.editor {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.editor-header h1 {
  color: white;
  font-size: 2rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 25px;
  border-radius: 10px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  color: white;
}

.save-btn {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.preview-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
}

.btn:hover {
  transform: translateY(-2px);
}

.editor-content {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.toolbar {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  max-height: 85vh;
  overflow-y: auto;
}

.tool-section {
  margin-bottom: 30px;
}

.tool-section h3 {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.input-field,
.textarea-field,
.select-field {
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.input-field::placeholder,
.textarea-field::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.input-field:focus,
.textarea-field:focus,
.select-field:focus {
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
}

.textarea-field {
  resize: vertical;
}

.select-field option {
  background: #1a1a2e;
  color: white;
}

.color-picker {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.color-option {
  width: 100%;
  height: 50px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.color-option:hover,
.color-option.active {
  transform: scale(1.05);
  border-color: white;
}

.decorations-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.decoration-btn {
  width: 100%;
  height: 50px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.decoration-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  margin-top: 10px;
}

.preview-area {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.card-content {
  width: 100%;
  height: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
}

.front-content {
  justify-content: center;
}

.card-title {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 30px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.to-text {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
}

.hint-text {
  position: absolute;
  bottom: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.message-text {
  font-size: 1.2rem;
  color: white;
  line-height: 1.8;
  margin-bottom: 30px;
  white-space: pre-line;
}

.from-text {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  align-self: flex-end;
}

.decoration-emoji {
  font-size: 2rem;
}

.clickable-decoration {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.clickable-decoration:hover {
  transform: scale(1.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  max-width: 500px;
}

.modal-content h2 {
  color: white;
  margin-bottom: 30px;
}

.modal-card {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.close-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 40px;
}
</style>
