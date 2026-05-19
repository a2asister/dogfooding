<template>
  <div class="service-page">
    <Header />

    <section class="hero-section">
      <div class="container">
        <h1>{{ t.service.title }}</h1>
        <p>我们致力于为您提供最优质的服务体验</p>
      </div>
    </section>

    <section class="section service-section">
      <div class="container">
        <div class="service-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>

        <div v-show="activeTab === 'faq'" class="tab-content">
          <h2 class="section-title" style="margin-bottom: 32px;">{{ t.service.faq }}</h2>
          
          <div class="faq-filters">
            <div class="faq-search">
              <input
                v-model="searchKeyword"
                type="text"
                class="form-input"
                :placeholder="t.service.faqPlaceholder"
                @input="handleSearch"
              />
              <span class="search-icon">🔍</span>
            </div>
            
            <div class="faq-categories">
              <button
                v-for="cat in categories"
                :key="cat.category"
                :class="{ active: activeCategory === cat.category }"
                @click="activeCategory = cat.category"
                class="category-btn"
              >
                {{ getCategoryLabel(cat.category) }}
                <span class="count">{{ cat.count }}</span>
              </button>
            </div>
          </div>

          <div v-if="filteredFaqs.length === 0" class="no-results">
            <p>未找到相关问题</p>
          </div>

          <div v-else class="faq-list">
            <div 
              v-for="(item, index) in filteredFaqs" 
              :key="item.id" 
              class="faq-item card"
              v-scroll-animate="{ animation: 'fade-up', delay: index * 50 }"
            >
              <div class="faq-question" @click="toggleFaq(item.id)">
                <span class="faq-q">Q:</span>
                <span class="question-text" v-html="highlightText(getQuestion(item))"></span>
                <span :class="['faq-icon', { expanded: expandedFaq === item.id }]">▼</span>
              </div>
              <transition name="faq-expand">
                <div v-show="expandedFaq === item.id" class="faq-answer">
                  <span class="faq-a">A:</span>
                  <span v-html="highlightText(getAnswer(item))"></span>
                  <span class="view-count">👁️ {{ item.view_count }} 人看过</span>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <div v-show="activeTab === 'ticket'" class="tab-content">
          <h2 class="section-title" style="margin-bottom: 32px;">提交问题反馈</h2>
          <div class="ticket-form card">
            <el-form :model="ticketForm" label-width="100px" @submit.prevent="submitTicket">
              <el-form-item label="您的昵称">
                <el-input v-model="ticketForm.user_name" placeholder="选填" />
              </el-form-item>
              <el-form-item label="联系方式" required>
                <el-input v-model="ticketForm.contact" placeholder="手机号或邮箱" />
              </el-form-item>
              <el-form-item label="问题类型" required>
                <el-select v-model="ticketForm.type" placeholder="请选择问题类型">
                  <el-option label="账号问题" value="account" />
                  <el-option label="充值问题" value="payment" />
                  <el-option label="游戏BUG" value="bug" />
                  <el-option label="建议反馈" value="suggestion" />
                  <el-option label="其他问题" value="other" />
                </el-select>
              </el-form-item>
              <el-form-item label="问题标题" required>
                <el-input v-model="ticketForm.title" placeholder="请简要描述您遇到的问题" />
              </el-form-item>
              <el-form-item label="问题详情" required>
                <el-input
                  v-model="ticketForm.content"
                  type="textarea"
                  :rows="6"
                  placeholder="请详细描述您遇到的问题，包括发生时间、具体场景、相关截图等信息，以便我们更好地为您解决问题"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" class="btn-primary" @click="submitTicket" :loading="submitting">
                  提交反馈
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <div v-show="activeTab === 'contact'" class="tab-content">
          <h2 class="section-title" style="margin-bottom: 32px;">联系客服</h2>
          <div class="contact-grid">
            <div class="contact-card card">
              <div class="contact-icon">📞</div>
              <h3>客服热线</h3>
              <p>400-888-8888</p>
              <span>工作时间：9:00-21:00</span>
            </div>
            <div class="contact-card card">
              <div class="contact-icon">📧</div>
              <h3>官方邮箱</h3>
              <p>support@stargame.com</p>
              <span>24小时内回复</span>
            </div>
            <div class="contact-card card">
              <div class="contact-icon">💬</div>
              <h3>在线客服</h3>
              <p>点击立即咨询</p>
              <span>工作时间：9:00-21:00</span>
            </div>
            <div class="contact-card card">
              <div class="contact-icon">👥</div>
              <h3>官方社群</h3>
              <p>QQ群：123456789</p>
              <span>与其他玩家交流</span>
            </div>
          </div>
        </div>

        <div v-show="activeTab === 'account'" class="tab-content">
          <h2 class="section-title" style="margin-bottom: 32px;">账号帮助</h2>
          <div class="account-help">
            <div v-for="(item, index) in accountHelpItems" :key="index" class="help-item card">
              <div class="help-question" @click="toggleHelp(index)">
                <span>{{ item.question }}</span>
                <span :class="['help-icon', { expanded: expandedHelp === index }]">▼</span>
              </div>
              <div v-show="expandedHelp === index" class="help-answer">
                <p v-html="item.answer"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { ticketApi, faqApi } from '../../api'
import { useI18n } from '../../composables/useI18n'
import type { FAQ } from '../../types'

const { t, locale } = useI18n()

const tabs = [
  { key: 'faq', label: '常见问题', icon: '❓' },
  { key: 'ticket', label: '问题反馈', icon: '📝' },
  { key: 'contact', label: '联系客服', icon: '💬' },
  { key: 'account', label: '账号帮助', icon: '🔐' }
]

const activeTab = ref('faq')
const expandedFaq = ref<number | null>(null)
const expandedHelp = ref<number | null>(null)
const submitting = ref(false)
const searchKeyword = ref('')
const activeCategory = ref('all')
const faqs = ref<FAQ[]>([])
const categories = ref<{ category: string; count: number }[]>([
  { category: 'all', count: 0 }
])

const ticketForm = reactive({
  user_name: '',
  contact: '',
  type: '',
  title: '',
  content: ''
})

const accountHelpItems = [
  {
    question: '如何注册新账号？',
    answer: '您可以通过游戏客户端或官网注册页面进行注册。支持手机号注册和第三方账号快捷登录。注册完成后请及时完善账号信息并绑定手机，以保证账号安全。'
  },
  {
    question: '如何保障账号安全？',
    answer: '为了您的账号安全，我们建议：1. 绑定手机号和邮箱；2. 设置高强度密码；3. 开启二次验证；4. 不要将账号转借他人；5. 定期检查登录记录，发现异常及时修改密码。'
  },
  {
    question: '忘记账号怎么办？',
    answer: '如果您忘记了账号，可以通过以下方式找回：1. 使用绑定的手机号/邮箱登录；2. 提供角色名称、服务器、充值记录等信息联系客服查询。为了方便找回，请妥善保管您的账号信息。'
  },
  {
    question: '如何注销账号？',
    answer: '账号注销后所有数据将被永久删除且无法恢复。如需注销，请登录游戏进入设置-账号安全-申请注销，按照提示完成操作。注销申请提交后有7天冷静期，期间可撤销申请。'
  }
]

const getQuestion = (item: FAQ): string => {
  return locale.value === 'en' ? item.question_en || item.question : item.question
}

const getAnswer = (item: FAQ): string => {
  return locale.value === 'en' ? item.answer_en || item.answer : item.answer
}

const getCategoryLabel = (category: string): string => {
  const map: Record<string, string> = {
    all: '全部',
    account: '账号问题',
    payment: '充值问题',
    technical: '技术问题',
    gameplay: '游戏问题',
    other: '其他问题'
  }
  return map[category] || category
}

const filteredFaqs = computed(() => {
  return faqs.value.filter(faq => {
    const matchCategory = activeCategory.value === 'all' || faq.category === activeCategory.value
    if (!matchCategory) return false
    
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      const question = getQuestion(faq).toLowerCase()
      const answer = getAnswer(faq).toLowerCase()
      return question.includes(keyword) || answer.includes(keyword)
    }
    return true
  })
})

const highlightText = (text: string): string => {
  if (searchKeyword.value) {
    try {
      const regex = new RegExp(`(${searchKeyword.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      return text.replace(regex, '<span class="highlight">$1</span>')
    } catch {
      return text
    }
  }
  return text
}

const toggleFaq = (id: number): void => {
  expandedFaq.value = expandedFaq.value === id ? null : id
  if (expandedFaq.value === id) {
    faqApi.getDetail(id).catch(() => {})
  }
}

const toggleHelp = (index: number): void => {
  expandedHelp.value = expandedHelp.value === index ? null : index
}

const handleSearch = (): void => {
  expandedFaq.value = null
}

const submitTicket = async (): Promise<void> => {
  if (!ticketForm.contact || !ticketForm.title || !ticketForm.content) {
    ElMessage.error('请填写完整的反馈信息')
    return
  }

  submitting.value = true
  try {
    await ticketApi.create({
      user_name: ticketForm.user_name || undefined,
      contact: ticketForm.contact,
      title: `[${ticketForm.type || 'other'}] ${ticketForm.title}`,
      content: ticketForm.content
    })
    ElMessage.success('提交成功！我们会尽快处理您的反馈')
    ticketForm.user_name = ''
    ticketForm.contact = ''
    ticketForm.type = ''
    ticketForm.title = ''
    ticketForm.content = ''
  } catch {
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const loadFaqs = async (): Promise<void> => {
  try {
    const faqList = await faqApi.getList({})
    faqs.value = faqList
  } catch {
    faqs.value = [
      { id: 1, question: '游戏最低配置要求是什么？', answer: '<p>Windows 10 64位，Intel Core i5-4460 / AMD FX-8350，8GB内存，NVIDIA GTX 960 2GB。</p>', category: 'technical', view_count: 1234, sort_order: 1, is_enabled: 1, created_at: '', updated_at: '' },
      { id: 2, question: '如何修改账号密码？', answer: '<p>登录后在个人中心-账号设置中可以修改密码。</p>', category: 'account', view_count: 856, sort_order: 2, is_enabled: 1, created_at: '', updated_at: '' },
      { id: 3, question: '充值未到账怎么办？', answer: '<p>请联系客服提供订单号，我们会在24小时内处理。</p>', category: 'payment', view_count: 2341, sort_order: 3, is_enabled: 1, created_at: '', updated_at: '' }
    ]
  }

  try {
    const cats = await faqApi.getCategories()
    categories.value = [{ category: 'all', count: faqs.value.length }, ...cats]
  } catch {
    categories.value = [
      { category: 'all', count: faqs.value.length },
      { category: 'account', count: faqs.value.filter(f => f.category === 'account').length },
      { category: 'payment', count: faqs.value.filter(f => f.category === 'payment').length },
      { category: 'technical', count: faqs.value.filter(f => f.category === 'technical').length },
      { category: 'gameplay', count: faqs.value.filter(f => f.category === 'gameplay').length },
      { category: 'other', count: faqs.value.filter(f => f.category === 'other').length }
    ].filter(c => c.count > 0)
  }
}

onMounted(() => {
  loadFaqs()
})
</script>

<style scoped lang="scss">
.service-page {
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
  padding: 60px 0;
}

.service-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;

  button {
    padding: 12px 28px;
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-secondary);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s var(--ease-smooth);
    font-size: 15px;

    &:hover, &.active {
      border-color: var(--secondary-color);
      color: var(--secondary-color);
    }

    &.active {
      background: var(--secondary-color);
      color: var(--bg-dark);
    }
  }
}

.faq-filters {
  max-width: 900px;
  margin: 0 auto 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .faq-search {
    position: relative;
    max-width: 400px;

    .form-input {
      padding-right: 40px;
    }

    .search-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0.5;
    }
  }

  .faq-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .category-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      color: var(--text-secondary);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.3s var(--ease-smooth);

      &:hover, &.active {
        border-color: var(--secondary-color);
        color: var(--secondary-color);
        background: rgba(0, 245, 255, 0.1);
      }

      .count {
        background: var(--bg-dark);
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 11px;
      }
    }
  }
}

.no-results {
  text-align: center;
  padding: 60px 0;
  color: var(--text-secondary);
}

.faq-list, .account-help {
  max-width: 900px;
  margin: 0 auto;
}

.faq-item, .help-item {
  margin-bottom: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s var(--ease-smooth);

  &:hover {
    border-color: var(--secondary-color);
  }

  .faq-question, .help-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);

    .faq-q {
      color: var(--secondary-color);
      font-weight: 700;
      margin-right: 12px;
    }

    .question-text {
      flex: 1;
    }

    .faq-icon, .help-icon {
      transition: transform 0.3s var(--ease-smooth);
      color: var(--secondary-color);
      font-size: 12px;

      &.expanded {
        transform: rotate(180deg);
      }
    }
  }

  .faq-answer, .help-answer {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
    color: var(--text-secondary);
    line-height: 1.8;

    .faq-a {
      color: var(--accent-gold);
      font-weight: 700;
      margin-right: 12px;
    }

    .view-count {
      display: block;
      margin-top: 12px;
      color: var(--text-muted);
      font-size: 13px;
    }
  }
}

.faq-expand-enter-active, .faq-expand-leave-active {
  transition: all 0.3s var(--ease-smooth);
}

.faq-expand-enter-from, .faq-expand-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
}

.ticket-form {
  max-width: 700px;
  margin: 0 auto;
  padding: 40px;

  :deep(.el-form-item__label) {
    color: var(--text-primary);
  }

  :deep(.el-input__wrapper), :deep(.el-textarea__inner), :deep(.el-select) {
    background: var(--bg-dark);
    box-shadow: 0 0 0 1px var(--border-color) inset;
    color: var(--text-primary);

    &:hover, &.is-focus {
      box-shadow: 0 0 0 1px var(--secondary-color) inset;
    }
  }

  :deep(.el-select-dropdown) {
    background: var(--bg-card);
  }

  :deep(.el-select-dropdown__item) {
    color: var(--text-primary);

    &:hover {
      background: var(--primary-color);
    }
  }

  .btn-primary {
    border: none;
  }
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.contact-card {
  text-align: center;
  padding: 40px 24px;

  .contact-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 18px;
    margin-bottom: 12px;
    color: var(--text-primary);
  }

  p {
    color: var(--secondary-color);
    font-size: 16px;
    margin-bottom: 8px;
    font-weight: 500;
  }

  span {
    color: var(--text-secondary);
    font-size: 13px;
  }
}

.highlight {
  background: rgba(255, 215, 0, 0.3);
  color: var(--accent-gold);
  padding: 0 2px;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .service-tabs {
    flex-wrap: wrap;

    button {
      flex: 1;
      min-width: calc(50% - 6px);
      padding: 10px 16px;
      font-size: 14px;
    }
  }

  .faq-filters {
    flex-direction: column;

    .faq-search {
      max-width: none;
    }
  }

  .contact-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
