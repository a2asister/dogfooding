<template>
  <div class="portfolio">
    <div class="portfolio-header">
      <h1>📂 我的作品集</h1>
      <div class="header-actions">
        <router-link to="/editor" class="btn create-btn">✏️ 创建新贺卡</router-link>
        <router-link to="/" class="btn back-btn">🏠 返回首页</router-link>
      </div>
    </div>

    <div class="tab-container">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'sent' }"
        @click="activeTab = 'sent'"
      >
        📤 我发送的 ({{ cardStore.sentCards.length }})
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'received' }"
        @click="activeTab = 'received'"
      >
        📥 我收到的 ({{ cardStore.receivedCards.length }})
      </button>
    </div>

    <div class="portfolio-content">
      <div v-if="activeTab === 'sent'">
        <div v-if="cardStore.sentCards.length > 0" class="cards-grid">
          <div class="portfolio-card" v-for="card in cardStore.sentCards" :key="card.id">
            <div class="card-preview" :style="{ background: card.background }">
              <h3>{{ card.title }}</h3>
              <p>To: {{ card.receiverName }}</p>
              <div class="card-badges">
                <span v-if="card.isReceived" class="badge received">✓ 已接收</span>
                <span v-else class="badge pending">⏳ 待接收</span>
              </div>
            </div>
            <div class="card-info">
              <p class="card-date">{{ formatDate(card.createdAt) }}</p>
              <p class="card-share-code">分享码: <strong>{{ card.shareCode }}</strong></p>
              <div class="card-actions">
                <button class="action-btn view-btn" @click="viewCard(card.id)">查看</button>
                <button class="action-btn share-btn" @click="shareCard(card)">分享</button>
                <button class="action-btn delete-btn" @click="deleteCard(card.id)">删除</button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <span class="empty-emoji">📭</span>
          <h2>还没有发送贺卡</h2>
          <p>开始创建你的第一张贺卡吧！</p>
          <router-link to="/editor" class="btn create-btn">开始制作</router-link>
        </div>
      </div>

      <div v-if="activeTab === 'received'">
        <div v-if="cardStore.receivedCards.length > 0" class="cards-grid">
          <div class="portfolio-card" v-for="card in cardStore.receivedCards" :key="card.id">
            <div class="card-preview" :style="{ background: card.background }">
              <h3>{{ card.title }}</h3>
              <p>From: {{ card.senderName }}</p>
              <div class="card-badges">
                <span class="badge received">✓ 已接收</span>
              </div>
            </div>
            <div class="card-info">
              <p class="card-date">接收时间: {{ formatDate(card.receivedAt || card.createdAt) }}</p>
              <div class="card-actions">
                <button class="action-btn view-btn" @click="viewCard(card.id)">查看</button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <span class="empty-emoji">📬</span>
          <h2>还没有收到贺卡</h2>
          <p>分享你的分享码给朋友，让他们给你发送贺卡吧！</p>
        </div>
      </div>
    </div>

    <div class="receive-section">
      <h2>🎁 接收贺卡</h2>
      <p class="receive-hint">输入朋友分享的贺卡码，接收来自朋友的祝福！</p>
      <div class="receive-form">
        <input 
          v-model="receiveCode" 
          type="text" 
          placeholder="请输入分享码"
          class="input-field"
          maxlength="10"
        />
        <button class="btn receive-btn" @click="receiveCard">接收贺卡</button>
      </div>
    </div>

    <div v-if="showShareModal" class="modal-overlay" @click="showShareModal = false">
      <div class="modal-content" @click.stop>
        <h2>📤 分享贺卡</h2>
        <p class="share-hint">将以下分享码发送给朋友，让他们接收你的贺卡祝福！</p>
        <div class="share-code-display">
          <span class="share-code">{{ currentShareCode }}</span>
        </div>
        <div class="share-actions">
          <button class="btn copy-btn" @click="copyShareCode">
            {{ copied ? '✓ 已复制' : '📋 复制分享码' }}
          </button>
          <button class="btn close-btn" @click="showShareModal = false">关闭</button>
        </div>
        <p class="share-url-hint">
          或者分享链接: <br />
          <span class="share-url">{{ shareUrl }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCardStore } from '@/stores/card'

const router = useRouter()
const userStore = useUserStore()
const cardStore = useCardStore()

const activeTab = ref<'sent' | 'received'>('sent')
const receiveCode = ref('')
const showShareModal = ref(false)
const currentShareCode = ref('')
const copied = ref(false)

const shareUrl = ref('')

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewCard = (id: number): void => {
  router.push(`/card/${id}`)
}

const shareCard = (card: { id: number; shareCode: string }): void => {
  currentShareCode.value = card.shareCode
  shareUrl.value = `${window.location.origin}/card/${card.id}`
  showShareModal.value = true
}

const copyShareCode = (): void => {
  navigator.clipboard.writeText(currentShareCode.value).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }).catch(() => {
    alert(`分享码: ${currentShareCode.value}`)
  })
}

const deleteCard = async (id: number): Promise<void> => {
  if (!confirm('确定要删除这张贺卡吗？删除后无法恢复。')) return
  
  try {
    const response = await fetch(`/api/cards/${id}?userId=${userStore.user?.id || 1}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      cardStore.removeCard(id)
      alert('删除成功！')
    } else {
      alert('删除失败，请重试')
    }
  } catch {
    alert('删除失败，请重试')
  }
}

const receiveCard = async (): Promise<void> => {
  if (!receiveCode.value.trim()) {
    alert('请输入分享码')
    return
  }

  try {
    const response = await fetch(`/api/cards/receive?userId=${userStore.user?.id || 1}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shareCode: receiveCode.value.toUpperCase() })
    })
    
    if (response.ok) {
      const card = await response.json()
      cardStore.receivedCards.push(card)
      alert('🎉 贺卡接收成功！')
      receiveCode.value = ''
      activeTab.value = 'received'
    } else {
      const error = await response.json()
      alert(error.message || '接收失败，请检查分享码是否正确')
    }
  } catch {
    alert('接收失败，请确保后端服务已启动')
  }
}

const loadCards = async (): Promise<void> => {
  try {
    const response = await fetch(`/api/cards?userId=${userStore.user?.id || 1}`)
    if (response.ok) {
      const data = await response.json()
      cardStore.setCards(data)
    }
  } catch {
    console.error('加载贺卡列表失败')
  }
}

onMounted(() => {
  loadCards()
})
</script>

<style scoped>
.portfolio {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.portfolio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.portfolio-header h1 {
  color: white;
  font-size: 2rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.tab-container {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  justify-content: center;
}

.tab-btn {
  padding: 12px 30px;
  border-radius: 25px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover,
.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
}

.portfolio-content {
  max-width: 1200px;
  margin: 0 auto 50px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.portfolio-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.portfolio-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
}

.card-preview {
  padding: 40px 20px;
  text-align: center;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.card-preview h3 {
  color: white;
  font-size: 1.3rem;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.card-preview p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin-bottom: 15px;
}

.card-badges {
  display: flex;
  gap: 8px;
}

.badge {
  padding: 5px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge.received {
  background: rgba(67, 233, 123, 0.3);
  color: #43e97b;
}

.badge.pending {
  background: rgba(253, 203, 110, 0.3);
  color: #fdcb6e;
}

.card-info {
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
}

.card-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  margin-bottom: 5px;
}

.card-share-code {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.card-share-code strong {
  color: #667eea;
  font-family: monospace;
  font-size: 1.1rem;
}

.card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 70px;
  padding: 10px 15px;
  border-radius: 10px;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.view-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.share-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.delete-btn {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.action-btn:hover {
  transform: scale(1.03);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-emoji {
  font-size: 5rem;
  display: block;
  margin-bottom: 20px;
}

.empty-state h2 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.receive-section {
  max-width: 600px;
  margin: 50px auto;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  text-align: center;
}

.receive-section h2 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.receive-hint {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 25px;
}

.receive-form {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.input-field {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
  padding: 15px 20px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.5);
  text-transform: none;
  letter-spacing: normal;
}

.input-field:focus {
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
}

.receive-btn {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
  padding: 15px 30px;
  font-size: 1rem;
  font-weight: 600;
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

.create-btn {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
}

.btn:hover {
  transform: translateY(-2px);
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
  width: 90%;
}

.modal-content h2 {
  color: white;
  margin-bottom: 15px;
}

.share-hint {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 25px;
}

.share-code-display {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
}

.share-code {
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  letter-spacing: 5px;
  font-family: monospace;
}

.share-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.copy-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px 30px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 30px;
}

.share-url-hint {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  line-height: 1.6;
}

.share-url {
  color: #4facfe;
  font-family: monospace;
  word-break: break-all;
  margin-top: 5px;
  display: inline-block;
}
</style>
