<template>
  <div class="service-page">
    <Header />

    <section class="hero-section">
      <div class="container">
        <h1>玩家服务</h1>
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
          <h2 class="section-title" style="margin-bottom: 32px;">常见问题</h2>
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
            <div v-for="(item, index) in accountHelpItems" :key="index" class="help-item card" @click="toggleHelp(index)">
              <div class="help-question">
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { ticketApi } from '../../api'

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

const ticketForm = reactive({
  user_name: '',
  contact: '',
  type: '',
  title: '',
  content: ''
})

const faqList = [
  {
    question: '如何找回忘记的账号密码？',
    answer: '您可以在登录界面点击"忘记密码"，按照提示通过绑定的手机号或邮箱重置密码。如遇到问题，请联系客服提供相关信息进行找回。'
  },
  {
    question: '游戏充值未到账怎么办？',
    answer: '请检查您的支付账户是否已扣款。如已扣款但钻石未到账，请提供订单截图和支付凭证联系客服处理，我们会在1-3个工作日内为您核实并补发。'
  },
  {
    question: '账号被封禁如何申诉？',
    answer: '如您认为账号是误封，可以通过客服通道提交申诉，提供账号相关信息和情况说明，我们会重新进行核查。申诉成功后账号将被解封。'
  },
  {
    question: '如何修改绑定的手机号？',
    answer: '登录游戏后，进入设置-账号安全-修改手机号，按照提示完成身份验证后即可修改。如原手机号已无法使用，请联系人工客服处理。'
  },
  {
    question: '游戏数据会自动保存吗？',
    answer: '是的，游戏数据会实时同步到服务器。但建议您定期检查账号安全，确保账号绑定信息完整，以防数据丢失。'
  },
  {
    question: '可以跨平台登录吗？',
    answer: '目前iOS和安卓账号数据不互通，但同一平台的不同设备可以使用同一账号登录。PC端账号独立，与移动端数据不互通。'
  }
]

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

const toggleFaq = (index: number): void => {
  expandedFaq.value = expandedFaq.value === index ? null : index
}

const toggleHelp = (index: number): void => {
  expandedHelp.value = expandedHelp.value === index ? null : index
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
    transition: all 0.3s ease;
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

.faq-list, .account-help {
  max-width: 900px;
  margin: 0 auto;
}

.faq-item, .help-item {
  margin-bottom: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;

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

    .faq-icon, .help-icon {
      transition: transform 0.3s ease;
      color: var(--secondary-color);

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
  }
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
</style>
