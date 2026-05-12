<template>
  <div class="app">
    <div class="container">
      <header class="app-header">
      <h1>💰 预算管理器</h1>
      <p>轻松管理您的消费</p>
    </header>

    <div class="budget-summary">
      <div class="summary-card">
        <div class="summary-label">预算总额</div>
        <div class="summary-value">¥{{ budgetAmount }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">已消费</div>
        <div class="summary-value spent">¥{{ totalExpenses }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">剩余</div>
        <div class="summary-value remaining">¥{{ remaining }}</div>
      </div>
    </div>

    <div class="progress-section">
      <WaterTankProgress 
        :percentage="percentage" 
        @click="showExpenseList = true"
      />
      <p class="hint">点击进度条查看消费明细</p>
    </div>

    <div class="action-buttons">
      <button class="btn btn-primary" @click="showBudgetModal = true">
        ⚙️ 设置预算</button>
      <button class="btn btn-secondary" @click="showAddExpense = true">
        ➕ 添加消费</button>
    </div>
  </div>

  <ExpenseList 
    :visible="showExpenseList"
    :expenses="expenses"
    @close="showExpenseList = false"
  />

  <transition name="fade">
    <div class="modal-overlay" v-if="showBudgetModal" @click.self="showBudgetModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>设置预算</h3>
          <button class="close-btn" @click="showBudgetModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>预算名称</label>
            <input type="text" v-model="budgetForm.name" placeholder="例如：月度预算" />
          </div>
          <div class="form-group">
            <label>预算金额</label>
            <input type="number" v-model="budgetForm.amount" placeholder="输入金额" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="showBudgetModal = false">取消</button>
          <button class="btn btn-confirm" @click="saveBudget">保存</button>
        </div>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div class="modal-overlay" v-if="showAddExpense" @click.self="showAddExpense = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>添加消费</h3>
          <button class="close-btn" @click="showAddExpense = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>消费描述</label>
            <input type="text" v-model="expenseForm.description" placeholder="例如：午餐" />
          </div>
          <div class="form-group">
            <label>消费金额</label>
            <input type="number" v-model="expenseForm.amount" placeholder="输入金额" step="0.01" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="showAddExpense = false">取消</button>
          <button class="btn btn-confirm" @click="addExpense">添加</button>
        </div>
      </div>
    </div>
  </transition>
  </div>
</template>

<script>
import axios from 'axios'
import WaterTankProgress from './components/WaterTankProgress.vue'
import ExpenseList from './components/ExpenseList.vue'

export default {
  name: 'App',
  components: {
    WaterTankProgress,
    ExpenseList
  },
  data() {
    return {
      budgets: [],
      expenses: [],
      showExpenseList: false,
      showBudgetModal: false,
      showAddExpense: false,
      budgetForm: {
        name: '月度预算',
        amount: 5000
      },
      expenseForm: {
        description: '',
        amount: ''
      }
    }
  },
  computed: {
    budgetAmount() {
      return this.budgets.length > 0 ? this.budgets[0].amount : 5000
    },
    totalExpenses() {
      return this.expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
    },
    remaining() {
      return Math.max(0, this.budgetAmount - this.totalExpenses)
    },
    percentage() {
      if (this.budgetAmount === 0) return 0
      return (this.totalExpenses / this.budgetAmount) * 100
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const [budgetsRes, expensesRes] = await Promise.all([
          axios.get('/api/budgets'),
          axios.get('/api/expenses')
        ])
        this.budgets = budgetsRes.data
        this.expenses = expensesRes.data
        
        if (this.budgets.length === 0) {
          this.initDefaultBudget()
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      }
    },
    async initDefaultBudget() {
      try {
        const res = await axios.post('/api/budgets', {
          name: '月度预算',
          amount: 5000
        })
        this.budgets = [res.data]
      } catch (error) {
        console.error('初始化预算失败:', error)
      }
    },
    async saveBudget() {
      try {
        if (this.budgets.length > 0) {
          await axios.put(`/api/budgets/${this.budgets[0].id}`, this.budgetForm)
        } else {
          const res = await axios.post('/api/budgets', this.budgetForm)
          this.budgets = [res.data]
        }
        await this.loadData()
        this.showBudgetModal = false
      } catch (error) {
        console.error('保存预算失败:', error)
      }
    },
    async addExpense() {
      if (!this.expenseForm.description || !this.expenseForm.amount) {
        alert('请填写完整信息')
        return
      }
      try {
        await axios.post('/api/expenses', {
          description: this.expenseForm.description,
          amount: parseFloat(this.expenseForm.amount)
        })
        await this.loadData()
        this.expenseForm = { description: '', amount: '' }
        this.showAddExpense = false
      } catch (error) {
        console.error('添加消费失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.app-header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.app-header h1 {
  font-size: 32px;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.app-header p {
  opacity: 0.9;
  font-size: 16px;
}

.budget-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.summary-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  color: white;
}

.summary-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
}

.summary-value.spent {
  color: #fde047;
}

.summary-value.remaining {
  color: #4ade80;
}

.progress-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.hint {
  color: white;
  opacity: 0.8;
  margin-top: 15px;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn {
  padding: 15px 30px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.btn-cancel {
  flex: 1;
  background: #f0f0f0;
  color: #666;
}

.btn-confirm {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>