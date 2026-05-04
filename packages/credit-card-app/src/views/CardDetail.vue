<template>
  <div class="detail-container">
    <div class="page-header"><button @click="goBack" class="btn btn-text">← 返回列表</button></div>
    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>加载中...</p></div>
    <template v-else-if="card">
      <div :class="'card-face card-' + card.cardType">
        <div class="card-brand">{{ card.brand }}</div>
        <div class="card-number">{{ card.cardNumber }}</div>
        <div class="card-footer">
          <div class="card-info"><span class="card-name">{{ card.cardTypeName }}</span><span class="card-expiry">有效期: {{ formatDate(card.expiryDate, true) }}</span></div>
          <div><span :class="'badge badge-' + card.status">{{ getStatusLabel(card.status) }}</span></div>
        </div>
      </div>
      <div class="content-grid">
        <div class="main-content">
          <div class="content-card">
            <h3>卡片信息</h3>
            <div class="info-grid">
              <div class="info-row"><span class="info-label">卡片编号</span><span class="info-value">{{ card.id }}</span></div>
              <div class="info-row"><span class="info-label">客户ID</span><span class="info-value">{{ card.customerId }}</span></div>
              <div class="info-row"><span class="info-label">卡片类型</span><span class="info-value">{{ card.cardTypeName }}</span></div>
              <div class="info-row"><span class="info-label">卡品牌</span><span class="info-value">{{ card.brand }}</span></div>
              <div class="info-row"><span class="info-label">信用额度</span><span class="info-value">¥{{ card.creditLimit.toLocaleString() }}</span></div>
              <div class="info-row"><span class="info-label">可用额度</span><span class="info-value text-success">¥{{ card.availableCredit.toLocaleString() }}</span></div>
              <div class="info-row"><span class="info-label">当前余额</span><span class="info-value text-danger">¥{{ card.currentBalance.toLocaleString() }}</span></div>
              <div class="info-row"><span class="info-label">最低还款</span><span class="info-value">¥{{ card.minPayment?.toLocaleString() || '0' }}</span></div>
              <div class="info-row"><span class="info-label">年利率</span><span class="info-value">{{ (card.interestRate * 100).toFixed(1) }}%</span></div>
              <div class="info-row"><span class="info-label">账单日</span><span class="info-value">每月 {{ card.billingCycle?.cycleDay || 10 }} 日</span></div>
              <div class="info-row"><span class="info-label">还款日</span><span class="info-value">每月 {{ card.billingCycle?.dueDay || 30 }} 日</span></div>
              <div class="info-row"><span class="info-label">发卡日期</span><span class="info-value">{{ formatDate(card.issueDate) }}</span></div>
            </div>
          </div>
          <div v-if="card.status !== 'expired'" class="content-card">
            <h3>状态管理</h3>
            <div class="action-buttons">
              <button v-if="card.status === 'active'" @click="handleFreeze" class="btn btn-warning">冻结卡片</button>
              <button v-if="card.status === 'frozen'" @click="handleUnfreeze" class="btn btn-success">解冻卡片</button>
            </div>
          </div>
        </div>
        <div class="sidebar">
          <div class="content-card">
            <h3>交易记录</h3>
            <div v-if="transactions.length === 0" class="empty-state-small"><p>暂无交易记录</p></div>
            <div v-else class="tx-list">
              <div v-for="tx in transactions.slice(0, 8)" :key="tx.id" class="tx-item">
                <div class="tx-info">
                  <span class="tx-name">{{ tx.merchantName || '交易' }}</span>
                  <span class="tx-date">{{ formatDate(tx.transactionDate) }}</span>
                </div>
                <span class="tx-amount" :class="tx.transactionType === 'payment' ? 'text-success' : 'text-danger'">
                  {{ tx.transactionType === 'payment' ? '+' : '-' }}¥{{ tx.amount.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCardById, getCardTransactions, updateCardStatus } from '../api/creditCard'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const card = ref(null)
const transactions = ref([])

const getStatusLabel = (s) => ({ active: '正常', frozen: '冻结', expired: '已过期' }[s] || s)
const formatDate = (d, short = false) => {
  if (!d) return '-'
  const dt = new Date(d)
  if (short) return `${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getFullYear().toString().slice(-2)}`
  return dt.toLocaleDateString('zh-CN')
}

const goBack = () => router.push('/credit-card/')

const fetchCard = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const [cardRes, txRes] = await Promise.all([
      getCardById(id),
      getCardTransactions(id).catch(() => ({ data: { success: true, data: [] } }))
    ])
    if (cardRes.data?.success) card.value = cardRes.data.data
    if (txRes.data?.success) transactions.value = txRes.data.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleFreeze = async () => {
  if (confirm('确定要冻结这张信用卡吗？')) {
    try {
      const res = await updateCardStatus(card.value.id, 'frozen')
      if (res.data?.success) { alert('卡片已冻结'); fetchCard() }
    } catch (e) { alert('操作失败') }
  }
}

const handleUnfreeze = async () => {
  if (confirm('确定要解冻这张信用卡吗？')) {
    try {
      const res = await updateCardStatus(card.value.id, 'active')
      if (res.data?.success) { alert('卡片已解冻'); fetchCard() }
    } catch (e) { alert('操作失败') }
  }
}

onMounted(() => fetchCard())
</script>

<style scoped>
.detail-container{padding:24px}
.page-header{margin-bottom:24px}
.loading-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;color:#999}
.spinner{width:40px;height:40px;border:3px solid #f0f0f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.card-face{height:240px;border-radius:16px;padding:24px;display:flex;flex-direction:column;justify-content:space-between;color:#fff;position:relative;overflow:hidden;margin-bottom:24px;max-width:400px}
.card-face::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,rgba(255,255,255,0.1) 0%,transparent 100%)}
.card-classic{background:linear-gradient(135deg,#667eea,#764ba2)}
.card-gold{background:linear-gradient(135deg,#f39c12,#e67e22)}
.card-platinum{background:linear-gradient(135deg,#34495e,#2c3e50)}
.card-black{background:linear-gradient(135deg,#1a1a2e,#16213e)}
.card-brand{font-size:20px;font-weight:700;letter-spacing:2px;opacity:0.9;position:relative;z-index:1}
.card-number{font-size:24px;letter-spacing:4px;font-family:'Courier New',monospace;font-weight:600;position:relative;z-index:1}
.card-footer{display:flex;justify-content:space-between;align-items:flex-end;position:relative;z-index:1}
.card-info{display:flex;flex-direction:column;gap:4px}
.card-name{font-size:16px;font-weight:600}
.card-expiry{font-size:12px;opacity:0.8}
.badge{padding:6px 12px;border-radius:4px;font-size:12px;font-weight:500}
.badge-active{background:rgba(82,196,26,0.9);color:#fff}
.badge-frozen{background:rgba(250,173,20,0.9);color:#fff}
.badge-expired{background:rgba(153,153,153,0.9);color:#fff}
.content-grid{display:grid;grid-template-columns:1fr 320px;gap:24px}
.content-card{background:#fff;border-radius:12px;padding:24px;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.content-card:last-child{margin-bottom:0}
.content-card h3{font-size:16px;font-weight:600;color:#1a1a2e;margin:0 0 16px 0}
.info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.info-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0f0f0}
.info-label{font-size:13px;color:#666}
.info-value{font-size:14px;color:#333;font-weight:500}
.info-value.text-success{color:#11998e}
.info-value.text-danger{color:#e74c3c}
.action-buttons{display:flex;gap:12px}
.empty-state-small{text-align:center;padding:20px;color:#999;font-size:13px}
.tx-list{display:flex;flex-direction:column;gap:12px}
.tx-item{display:flex;justify-content:space-between;align-items:center;padding:10px;background:#fafafa;border-radius:8px}
.tx-info{display:flex;flex-direction:column;gap:4px}
.tx-name{font-size:14px;font-weight:500;color:#333}
.tx-date{font-size:12px;color:#999}
.tx-amount{font-size:14px;font-weight:600}
.tx-amount.text-success{color:#11998e}
.tx-amount.text-danger{color:#e74c3c}
.sidebar{position:sticky;top:24px}
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s;border:none}
.btn-text{background:transparent;color:#3b82f6;padding:0;margin-bottom:12px}
.btn-text:hover{color:#2563eb}
.btn-warning{background:#faad14;color:#fff}
.btn-warning:hover{background:#d48806}
.btn-success{background:#52c41a;color:#fff}
.btn-success:hover{background:#389e0d}
</style>
