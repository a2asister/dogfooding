<template>
  <div class="download-page">
    <Header />

    <section class="hero-section">
      <div class="container">
        <h1>下载游戏</h1>
        <p>选择适合你的平台，开启星际冒险</p>
      </div>
    </section>

    <section class="section download-section">
      <div class="container">
        <div class="download-platforms">
          <div v-for="platform in platforms" :key="platform.name" class="platform-card card">
            <div class="platform-icon">{{ platform.icon }}</div>
            <h3>{{ platform.name }}</h3>
            <p class="platform-desc">{{ platform.description }}</p>
            <button class="btn-primary download-btn" @click="downloadGame(platform)">
              下载客户端
            </button>
            <span class="platform-version">版本：{{ platform.version }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section config-section">
      <div class="container">
        <h2 class="section-title">系统配置要求</h2>
        <div class="config-grid">
          <div class="config-card card">
            <h3>最低配置</h3>
            <ul>
              <li><span>操作系统：</span>Windows 10 64位</li>
              <li><span>处理器：</span>Intel Core i5-4460 / AMD FX-8350</li>
              <li><span>内存：</span>8 GB RAM</li>
              <li><span>显卡：</span>NVIDIA GTX 960 / AMD Radeon R7 370</li>
              <li><span>存储空间：</span>50 GB 可用空间</li>
              <li><span>网络：</span>宽带互联网连接</li>
            </ul>
          </div>
          <div class="config-card card recommended">
            <div class="recommend-badge">推荐</div>
            <h3>推荐配置</h3>
            <ul>
              <li><span>操作系统：</span>Windows 10/11 64位</li>
              <li><span>处理器：</span>Intel Core i7-8700 / AMD Ryzen 5 3600</li>
              <li><span>内存：</span>16 GB RAM</li>
              <li><span>显卡：</span>NVIDIA RTX 2060 / AMD RX 5700</li>
              <li><span>存储空间：</span>50 GB SSD</li>
              <li><span>网络：</span>宽带互联网连接</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section faq-section">
      <div class="container">
        <h2 class="section-title">安装常见问题</h2>
        <div class="faq-list">
          <div v-for="(item, index) in faqList" :key="index" class="faq-item card" @click="toggleFaq(index)">
            <div class="faq-question">
              <span>{{ item.question }}</span>
              <span :class="['faq-icon', { expanded: expandedFaq === index }]">▼</span>
            </div>
            <div v-show="expandedFaq === index" class="faq-answer">
              {{ item.answer }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section reservation-section">
      <div class="container">
        <div class="reservation-card card">
          <div class="reservation-content">
            <h2>新游预约</h2>
            <p>填写手机号，第一时间获取游戏最新动态和专属礼包</p>
            <div class="reservation-form">
              <input
                v-model="phone"
                type="tel"
                placeholder="请输入手机号码"
                maxlength="11"
              >
              <select v-model="platform">
                <option value="ios">iOS</option>
                <option value="android">Android</option>
                <option value="pc">PC</option>
              </select>
              <button class="btn-primary" @click="submitReservation" :disabled="submitting">
                {{ submitting ? '提交中...' : '立即预约' }}
              </button>
            </div>
            <p class="reservation-count">已有 <strong>{{ reservationCount }}</strong> 位玩家预约</p>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { reservationApi } from '../../api'

const platforms = [
  { name: 'Windows PC', icon: '🖥️', description: '适合 Windows 10/11 64位系统', version: 'v1.2.0' },
  { name: 'macOS', icon: '🍎', description: '适合 macOS 10.15+ 系统', version: 'v1.2.0' },
  { name: 'iOS', icon: '📱', description: '适合 iPhone 和 iPad 设备', version: 'v1.2.0' },
  { name: 'Android', icon: '🤖', description: '适合 Android 8.0+ 设备', version: 'v1.2.0' }
]

const faqList = [
  {
    question: '下载速度慢怎么办？',
    answer: '建议使用官方下载器进行下载，或选择在网络空闲时段下载。如遇下载中断，可以使用断点续传功能继续下载。'
  },
  {
    question: '安装时提示磁盘空间不足？',
    answer: '游戏完整安装需要约50GB的存储空间。建议清理磁盘空间后重新安装，或将游戏安装到其他磁盘分区。'
  },
  {
    question: '游戏无法启动怎么办？',
    answer: '请检查显卡驱动是否为最新版本，确认安装了必要的运行库（DirectX、VC++等）。如问题持续，请联系客服获取帮助。'
  },
  {
    question: '如何更新游戏？',
    answer: '启动游戏客户端后会自动检测更新，也可以在设置中手动检查更新。大版本更新建议使用完整安装包重新安装。'
  },
  {
    question: '下载后可以在多台电脑上安装吗？',
    answer: '可以的，您可以使用同一账号在多台设备上安装游戏，但同一时间只能在一台设备上登录游戏。'
  }
]

const expandedFaq = ref<number | null>(null)
const phone = ref('')
const platform = ref('pc')
const submitting = ref(false)
const reservationCount = ref(0)

const toggleFaq = (index: number): void => {
  expandedFaq.value = expandedFaq.value === index ? null : index
}

const downloadGame = (platform: { name: string }): void => {
  ElMessage.success(`${platform.name} 客户端下载即将开始...`)
}

const submitReservation = async (): Promise<void> => {
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    ElMessage.error('请输入正确的手机号码')
    return
  }

  submitting.value = true
  try {
    await reservationApi.create({ phone: phone.value, platform: platform.value })
    ElMessage.success('预约成功！我们将在游戏上线时通知您')
    phone.value = ''
    reservationCount.value++
  } catch {
    ElMessage.error('预约失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const loadReservationStats = async (): Promise<void> => {
  try {
    const result = await reservationApi.getStats()
    reservationCount.value = result.total
  } catch {
    reservationCount.value = 12580
  }
}

onMounted(() => {
  loadReservationStats()
})
</script>

<style scoped lang="scss">
.download-page {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-purple));
  padding: 80px 0;
  text-align: center;

  h1 {
    font-size: 48px;
    color: white;
    margin-bottom: 16px;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 20px;
  }
}

.section {
  padding: 80px 0;
}

.download-platforms {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.platform-card {
  text-align: center;
  padding: 40px 24px;

  .platform-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 20px;
    margin-bottom: 8px;
    color: var(--text-primary);
  }

  .platform-desc {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 20px;
  }

  .download-btn {
    width: 100%;
    margin-bottom: 12px;
  }

  .platform-version {
    font-size: 12px;
    color: var(--text-secondary);
  }
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.config-card {
  position: relative;
  padding: 32px;

  h3 {
    font-size: 24px;
    margin-bottom: 24px;
    color: var(--text-primary);
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-secondary);

      &:last-child {
        border-bottom: none;
      }

      span {
        color: var(--text-primary);
        font-weight: 500;
      }
    }
  }

  &.recommended {
    border-color: var(--secondary-color);
    box-shadow: 0 0 30px rgba(0, 245, 255, 0.2);
  }

  .recommend-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: var(--secondary-color);
    color: var(--bg-dark);
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }
}

.faq-list {
  max-width: 900px;
  margin: 0 auto;
}

.faq-item {
  margin-bottom: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--secondary-color);
  }

  .faq-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);

    .faq-icon {
      transition: transform 0.3s ease;
      color: var(--secondary-color);

      &.expanded {
        transform: rotate(180deg);
      }
    }
  }

  .faq-answer {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
    color: var(--text-secondary);
    line-height: 1.8;
  }
}

.reservation-card {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-purple));
  border: none;
  padding: 60px;
  text-align: center;

  .reservation-content {
    h2 {
      font-size: 32px;
      color: white;
      margin-bottom: 12px;
    }

    p {
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 32px;
    }
  }

  .reservation-form {
    display: flex;
    gap: 12px;
    max-width: 600px;
    margin: 0 auto 20px;

    input, select {
      flex: 1;
      padding: 14px 20px;
      border: none;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 16px;

      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }

      &:focus {
        outline: none;
        background: rgba(255, 255, 255, 0.15);
      }
    }

    select option {
      background: var(--bg-dark);
      color: var(--text-primary);
    }

    button {
      white-space: nowrap;
    }
  }

  .reservation-count {
    color: rgba(255, 255, 255, 0.8);

    strong {
      color: var(--secondary-color);
      font-size: 24px;
      margin: 0 4px;
    }
  }
}
</style>
