<template>
  <transition name="slide-up">
    <div class="expense-list-overlay" v-if="visible" @click.self="handleClose">
      <div class="expense-list-container" @click.stop>
        <div class="list-header">
        <h3>消费明细</h3>
        <button class="close-btn" @click="handleClose">×</button>
      </div>
      <div class="expense-cards">
        <div 
          class="expense-card" 
          v-for="(expense, index) in expenses" 
          :key="expense.id"
          :style="{ animationDelay: (index * 0.1) + 's' }"
          :class="{ 'card-enter': visible }"
        >
          <div class="card-icon">
            <span>💸</span>
          </div>
          <div class="card-content">
            <div class="card-description">{{ expense.description }}</div>
            <div class="card-date">{{ formatDate(expense.createdAt) }}</div>
          </div>
          <div class="card-amount">-¥{{ expense.amount }}</div>
        </div>
        <div class="empty-state" v-if="expenses.length === 0">
          <span class="empty-icon">📝</span>
          <p>暂无消费记录</p>
        </div>
      </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ExpenseList',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    expenses: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    formatDate(date) {
      const d = new Date(date)
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.expense-list-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.expense-list-container {
  width: 100%;
  max-width: 500px;
  max-height: 70vh;
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  overflow-y: auto;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}

.slide-up-enter-from .expense-list-container,
.slide-up-leave-to .expense-list-container {
  transform: translateY(100%);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.list-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
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
  transition: background 0.3s;
}

.close-btn:hover {
  background: #e0e0e0;
}

.expense-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.expense-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  border-radius: 12px;
  opacity: 0;
  transform: translateY(20px);
}

.card-enter {
  animation: cardSlideIn 0.4s ease forwards;
}

@keyframes cardSlideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.card-content {
  flex: 1;
}

.card-description {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.card-date {
  font-size: 12px;
  color: #888;
}

.card-amount {
  font-weight: bold;
  color: #ef4444;
  font-size: 18px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #888;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}
</style>