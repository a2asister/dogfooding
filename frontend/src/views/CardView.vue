<template>
  <div class="card-view">
    <Fireworks />
    <div class="card-container">
      <Card3D ref="cardRef">
        <template #front>
          <div class="card-content front-content" :style="{ background: card?.background || defaultBg }">
            <AnimatedText :delay="0.3">
              <h2 class="card-title">{{ card?.title || '节日祝福' }}</h2>
            </AnimatedText>
            <AnimatedText :delay="0.6">
              <p class="to-text">To: {{ card?.receiverName || '亲爱的朋友' }}</p>
            </AnimatedText>
            <p class="hint-text">点击卡片翻转</p>
          </div>
        </template>
        <template #back>
          <div class="card-content back-content" :style="{ background: card?.background || defaultBg }">
            <AnimatedText :delay="0.3">
              <p class="message-text">{{ card?.message || '在这里写下你的祝福...' }}</p>
            </AnimatedText>
            <AnimatedText :delay="0.6">
              <p class="from-text">From: {{ card?.senderName || '你的朋友' }}</p>
            </AnimatedText>
          </div>
        </template>
      </Card3D>
    </div>
    
    <div class="card-actions">
      <router-link to="/" class="btn home-btn">返回首页</router-link>
      <router-link to="/portfolio" class="btn portfolio-btn">我的作品集</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Card3D from '@/components/Card3D.vue'
import AnimatedText from '@/components/AnimatedText.vue'
import Fireworks from '@/components/Fireworks.vue'

const route = useRoute()
const cardRef = ref()

interface Card {
  id: number
  title: string
  receiverName: string
  senderName: string
  message: string
  background: string
}

const card = ref<Card | null>(null)
const defaultBg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

const loadCard = async (): Promise<void> => {
  const id = route.params.id
  try {
    const response = await fetch(`/api/cards/${id}`)
    if (response.ok) {
      card.value = await response.json()
    }
  } catch {
    card.value = {
      id: Number(id),
      title: '新年快乐',
      receiverName: '亲爱的朋友',
      senderName: '我',
      message: '祝你新年快乐，万事如意！\n愿新的一年带给你无尽的快乐和幸福！',
      background: defaultBg
    }
  }
}

onMounted(() => {
  loadCard()
})
</script>

<style scoped>
.card-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  position: relative;
  z-index: 10;
}

.card-container {
  margin-bottom: 40px;
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

.card-actions {
  display: flex;
  gap: 20px;
}

.btn {
  padding: 12px 35px;
  border-radius: 50px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  color: white;
}

.home-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.portfolio-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}
</style>
