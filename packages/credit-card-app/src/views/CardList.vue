<template>
  <div class="card-container">
    <div class="page-header">
      <div class="header-left">
        <h1>信用卡管理</h1>
        <p class="subtitle">查看和管理所有信用卡</p>
      </div>
      <div class="header-actions">
        <router-link to="/credit-card/create" class="btn btn-primary">+ 申请信用卡</router-link>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2)"><span class="stat-emoji">💳</span></div>
        <div class="stat-info"><span class="stat-value">{{ totalCards }}</span><span class="stat-label">总卡片数</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #11998e, #38ef7d)"><span class="stat-emoji">💰</span></div>
        <div class="stat-info"><span class="stat-value">¥{{ totalBalance.toLocaleString() }}</span><span class="stat-label">总余额</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c)"><span class="stat-emoji">💎</span></div>
        <div class="stat-info"><span class="stat-value">¥{{ totalLimit.toLocaleString() }}</span><span class="stat-label">总信用额度</span></div>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-group">
        <label>客户ID</label>
        <input v-model="filters.customerId" type="text" class="form-input" placeholder="输入客户ID" @keyup.enter="fetchCards" />
      </div>
      <div class="filter-group">
        <label>卡片类型</label>
        <select v-model="filters.cardType" class="form-input" @change="fetchCards">
          <option value="">全部</option>
          <option value="classic">普卡</option>
          <option value="gold">金卡</option>
          <option value="platinum">白金卡</option>
          <option value="black">黑卡</option>
        </select>
      </div>
      <div class="filter-group">
        <label>状态</label>
        <select v-model="filters.status" class="form-input" @change="fetchCards">
          <option value="">全部</option>
          <option value="active">正常</option>
          <option value="frozen">冻结</option>
          <option value="expired">已过期</option>
        </select>
      </div>
      <div class="filter-group">
        <button @click="fetchCards" class="btn btn-primary">查询</button>
      </div>
    </div>

    <div class="content-card">
      <div v-if="loading" class="loading-state"><div class="spinner"></div><p>加载中...</p></div>
      <div v-else-if="cards.length === 0" class="empty-state"><span class="empty-icon">📭</span><p>暂无信用卡记录</p></div>
      <div v-else>
        <div class="card-grid">
          <div v-for="card in cards" :key="card.id" class="credit-card-item" @click="goToDetail(card.id)">
            <div :class="'card-face card-' + card.cardType">
              <div class="card-brand">{{ card.brand }}</div>
              <div class="card-number">{{ card.cardNumber }}</div>
              <div class="card-footer">
                <div class="card-info">
                  <span class="card-name">{{ card.cardTypeName }}</span>
                  <span class="card-expiry">有效期: {{ formatDate(card.expiryDate, true) }}</span>
                </div>
                <div class="card-status">
                  <span :class="'badge badge-' + card.status">{{ getStatusLabel(card.status) }}</span>
                </div>
              </div>
            </div>
            <div class="card-details">
              <div class="detail-row"><span class="label">可用额度</span><span class="value highlight">¥{{ card.availableCredit.toLocaleString() }}</span></div>
              <div class="detail-row"><span class="label">当前余额</span><span class="value text-danger">¥{{ card.currentBalance.toLocaleString() }}</span></div>
              <div class="detail-row"><span class="label">信用额度</span><span class="value">¥{{ card.creditLimit.toLocaleString() }}</span></div>
              <div class="detail-row"><span class="label">年利率</span><span class="value">{{ (card.interestRate * 100).toFixed(1) }}%</span></div>
            </div>
          </div>
        </div>
        <div v-if="pagination.totalPages > 1" class="pagination">
          <button @click="changePage(pagination.page - 1)" :disabled="pagination.page <= 1" class="page-btn">上一页</button>
          <span class="page-info">第 {{ pagination.page }} 页 / 共 {{ pagination.totalPages }} 页</span>
          <button @click="changePage(pagination.page + 1)" :disabled="pagination.page >= pagination.totalPages" class="page-btn">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCards } from '../api/creditCard'

const router = useRouter()
const loading = ref(false)
const cards = ref([])
const filters = ref({ customerId: '', cardType: '', status: '' })
const pagination = ref({ page: 1, pageSize: 10, total: 0, totalPages: 0 })

const totalCards = computed(() => cards.value.length)
const totalBalance = computed(() => cards.value.reduce((sum, c) => sum + c.currentBalance, 0))
const totalLimit = computed(() => cards.value.reduce((sum, c) => sum + c.creditLimit, 0))

const getStatusLabel = (s) => ({ active: '正常', frozen: '冻结', expired: '已过期' }[s] || s)
const formatDate = (d, short = false) => {
  if (!d) return '-'
  const dt = new Date(d)
  if (short) return `${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getFullYear().toString().slice(-2)}`
  return dt.toLocaleDateString('zh-CN')
}

const fetchCards = async () => {
  loading.value = true
  try {
    const params = { page: pagination.value.page, pageSize: pagination.value.pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (!params[k]) delete params[k] })
    const res = await getCards(params)
    if (res.data?.success) { cards.value = res.data.data.creditCards; pagination.value = res.data.data.pagination }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const goToDetail = (id) => router.push(`/credit-card/${id}`)
const changePage = (p) => { pagination.value.page = p; fetchCards() }

onMounted(() => fetchCards())
</script>

<style scoped>
.card-container{padding:24px}
.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
.page-header h1{font-size:24px;font-weight:600;color:#1a1a2e;margin:0}
.subtitle{font-size:14px;color:#666;margin-top:4px}
.stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:24px}
.stat-card{background:#fff;border-radius:12px;padding:20px;display:flex;align-items:center;gap:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.stat-icon{width:56px;height:56px;border-radius:12px;display:flex;align-items:center;justify-content:center}
.stat-emoji{font-size:24px}
.stat-info{display:flex;flex-direction:column;gap:4px}
.stat-value{font-size:22px;font-weight:600;color:#1a1a2e}
.stat-label{font-size:13px;color:#666}
.filter-section{display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap;align-items:flex-end}
.filter-group{display:flex;flex-direction:column;gap:6px}
.filter-group label{font-size:13px;font-weight:500;color:#555}
.form-input{padding:8px 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;min-width:140px}
.form-input:focus{outline:none;border-color:#3b82f6}
.content-card{background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.loading-state,.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;color:#999}
.spinner{width:40px;height:40px;border:3px solid #f0f0f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-icon{font-size:48px;margin-bottom:12px}
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:24px}
.credit-card-item{cursor:pointer;transition:transform 0.3s}
.credit-card-item:hover{transform:translateY(-4px)}
.card-face{height:220px;border-radius:16px;padding:24px;display:flex;flex-direction:column;justify-content:space-between;color:#fff;position:relative;overflow:hidden}
.card-face::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,rgba(255,255,255,0.1) 0%,transparent 100%)}
.card-classic{background:linear-gradient(135deg,#667eea,#764ba2)}
.card-gold{background:linear-gradient(135deg,#f39c12,#e67e22)}
.card-platinum{background:linear-gradient(135deg,#34495e,#2c3e50)}
.card-black{background:linear-gradient(135deg,#1a1a2e,#16213e)}
.card-brand{font-size:18px;font-weight:700;letter-spacing:2px;opacity:0.9}
.card-number{font-size:22px;letter-spacing:4px;font-family:'Courier New',monospace;font-weight:600}
.card-footer{display:flex;justify-content:space-between;align-items:flex-end}
.card-info{display:flex;flex-direction:column;gap:4px}
.card-name{font-size:14px;font-weight:600}
.card-expiry{font-size:12px;opacity:0.8}
.card-status{position:relative;z-index:1}
.badge{padding:4px 10px;border-radius:4px;font-size:12px;font-weight:500}
.badge-active{background:rgba(82,196,26,0.9);color:#fff}
.badge-frozen{background:rgba(250,173,20,0.9);color:#fff}
.badge-expired{background:rgba(153,153,153,0.9);color:#fff}
.card-details{margin-top:16px;padding:16px;background:#fafafa;border-radius:8px;display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.detail-row{display:flex;justify-content:space-between;align-items:center}
.detail-row .label{font-size:13px;color:#666}
.detail-row .value{font-size:14px;font-weight:600;color:#333}
.detail-row .value.highlight{color:#11998e}
.detail-row .value.text-danger{color:#e74c3c}
.pagination{display:flex;justify-content:center;align-items:center;gap:16px;margin-top:24px;padding-top:20px;border-top:1px solid #f0f0f0}
.page-btn{padding:8px 16px;border:1px solid #d9d9d9;border-radius:6px;background:#fff;color:#333;font-size:14px;cursor:pointer;transition:all 0.2s}
.page-btn:hover:not(:disabled){border-color:#3b82f6;color:#3b82f6}
.page-btn:disabled{color:#ccc;cursor:not-allowed}
.page-info{font-size:14px;color:#666}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s;border:none}
.btn-primary{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff}
.btn-primary:hover{opacity:0.9}
</style>
