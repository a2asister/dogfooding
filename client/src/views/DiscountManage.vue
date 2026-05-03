<template>
  <div class="discount-manage">
    <div class="action-bar">
      <button class="btn btn-primary" @click="openModal()">
        + 添加优惠
      </button>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="discounts.length === 0" class="empty-state">
      <div class="empty-state-icon">🎫</div>
      <h3>暂无优惠</h3>
      <p>点击上方按钮创建第一个优惠活动</p>
    </div>
    
    <div v-else class="discounts-list">
      <div 
        v-for="discount in discounts" 
        :key="discount.id" 
        class="discount-card card"
      >
        <div class="discount-header">
          <div class="discount-badge-wrapper">
            <div class="discount-badge" :class="discount.type">
              {{ getDiscountBadge(discount) }}
            </div>
          </div>
          <div class="discount-info">
            <h3 class="discount-name">{{ discount.name }}</h3>
            <p class="discount-desc">{{ discount.description || getDiscountDesc(discount) }}</p>
            <div class="discount-meta">
              <span :class="['badge', discount.active ? 'badge-success' : 'badge-danger']">
                {{ discount.active ? '已启用' : '已禁用' }}
              </span>
              <span v-if="!discount.stackable" class="badge badge-warning">
                不可叠加
              </span>
              <span class="priority">优先级: {{ discount.priority }}</span>
            </div>
          </div>
          <div class="discount-actions">
            <button class="btn btn-secondary" @click="toggleActive(discount)">
              {{ discount.active ? '禁用' : '启用' }}
            </button>
            <button class="btn btn-success" @click="openModal(discount)">
              编辑
            </button>
            <button class="btn btn-danger" @click="confirmDelete(discount)">
              删除
            </button>
          </div>
        </div>
        
        <div class="discount-details">
          <div class="detail-item">
            <span class="label">有效期：</span>
            <span class="value">
              {{ formatDate(discount.startDate) }} 至 {{ formatDate(discount.endDate) }}
            </span>
          </div>
          
          <div v-if="discount.minAmount > 0" class="detail-item">
            <span class="label">最低消费：</span>
            <span class="value">¥{{ discount.minAmount.toFixed(2) }}</span>
          </div>
          
          <div v-if="discount.maxDiscount" class="detail-item">
            <span class="label">最大优惠：</span>
            <span class="value">¥{{ discount.maxDiscount.toFixed(2) }}</span>
          </div>
          
          <div v-if="discount.applicableProductIds && discount.applicableProductIds.length > 0" class="detail-item">
            <span class="label">适用商品：</span>
            <span class="value">指定 {{ discount.applicableProductIds.length }} 个商品</span>
          </div>
          
          <div v-if="discount.applicableCategory" class="detail-item">
            <span class="label">适用分类：</span>
            <span class="value">{{ discount.applicableCategory }}</span>
          </div>
          
          <div v-if="discount.excludeProductIds && discount.excludeProductIds.length > 0" class="detail-item">
            <span class="label">排除商品：</span>
            <span class="value">{{ discount.excludeProductIds.length }} 个商品</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal" style="max-width: 700px;">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingDiscount ? '编辑优惠' : '添加优惠' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveDiscount">
            <div class="form-group">
              <label class="form-label">优惠名称 *</label>
              <input 
                type="text" 
                v-model="formData.name" 
                class="form-input"
                placeholder="例如：双11全场8折"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">优惠类型 *</label>
              <select v-model="formData.type" class="form-select" required>
                <option value="percentage">折扣（百分比）</option>
                <option value="fixed">立减（固定金额）</option>
                <option value="fullReduction">满减</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">优惠值 *</label>
              <div class="input-with-hint">
                <input 
                  type="number" 
                  v-model.number="formData.value" 
                  class="form-input"
                  :placeholder="getDiscountValuePlaceholder()"
                  step="0.01"
                  min="0"
                  required
                />
                <span class="hint">{{ getDiscountValueHint() }}</span>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">最低消费金额</label>
                <input 
                  type="number" 
                  v-model.number="formData.minAmount" 
                  class="form-input"
                  placeholder="0为不限制"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div class="form-group" style="flex: 1;">
                <label class="form-label">最大优惠金额</label>
                <input 
                  type="number" 
                  v-model.number="formData.maxDiscount" 
                  class="form-input"
                  placeholder="留空为不限制"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">开始时间</label>
                <input 
                  type="datetime-local" 
                  v-model="formData.startDateStr" 
                  class="form-input"
                />
              </div>
              
              <div class="form-group" style="flex: 1;">
                <label class="form-label">结束时间</label>
                <input 
                  type="datetime-local" 
                  v-model="formData.endDateStr" 
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">优先级</label>
                <input 
                  type="number" 
                  v-model.number="formData.priority" 
                  class="form-input"
                  placeholder="数值越小优先级越高"
                  min="1"
                />
              </div>
              
              <div class="form-group" style="flex: 1; display: flex; align-items: center; gap: 2rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <input type="checkbox" v-model="formData.active" />
                  <span>启用优惠</span>
                </label>
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <input type="checkbox" v-model="formData.stackable" />
                  <span>可与其他优惠叠加</span>
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">优惠描述</label>
              <textarea 
                v-model="formData.description" 
                class="form-textarea"
                placeholder="优惠活动的详细说明"
                rows="2"
              ></textarea>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                取消
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { discountApi } from '@/api'

export default {
  name: 'DiscountManage',
  data() {
    return {
      discounts: [],
      loading: true,
      showModal: false,
      editingDiscount: null,
      saving: false,
      message: '',
      messageType: 'success',
      formData: {
        name: '',
        type: 'percentage',
        value: '',
        minAmount: 0,
        maxDiscount: null,
        priority: 1,
        stackable: true,
        active: true,
        description: '',
        startDateStr: '',
        endDateStr: '',
        applicableProductIds: [],
        applicableCategory: null,
        excludeProductIds: []
      }
    }
  },
  async created() {
    await this.fetchDiscounts()
  },
  methods: {
    async fetchDiscounts() {
      this.loading = true
      try {
        const response = await discountApi.getAll()
        if (response.data.success) {
          this.discounts = response.data.data
        }
      } catch (error) {
        console.error('获取优惠列表失败:', error)
        this.discounts = []
      } finally {
        this.loading = false
      }
    },
    getDiscountBadge(discount) {
      switch (discount.type) {
        case 'percentage':
          return `${discount.value}折`
        case 'fixed':
          return `减${discount.value}元`
        case 'fullReduction':
          return `满${discount.minAmount}减${discount.value}`
        default:
          return '优惠'
      }
    },
    getDiscountDesc(discount) {
      switch (discount.type) {
        case 'percentage':
          return `全场${discount.value}折${discount.maxDiscount ? `，最多减${discount.maxDiscount}元` : ''}`
        case 'fixed':
          return `立减${discount.value}元${discount.minAmount > 0 ? `（满${discount.minAmount}元可用）` : ''}`
        case 'fullReduction':
          return `满${discount.minAmount}元减${discount.value}元`
        default:
          return ''
      }
    },
    getDiscountValuePlaceholder() {
      switch (this.formData.type) {
        case 'percentage':
          return '例如：8 表示8折'
        case 'fixed':
          return '例如：50 表示立减50元'
        case 'fullReduction':
          return '例如：30 表示满减30元'
        default:
          return ''
      }
    },
    getDiscountValueHint() {
      switch (this.formData.type) {
        case 'percentage':
          return '%'
        case 'fixed':
          return '元'
        case 'fullReduction':
          return '元（每满最低消费金额减）'
        default:
          return ''
      }
    },
    openModal(discount = null) {
      this.editingDiscount = discount
      if (discount) {
        this.formData = {
          name: discount.name,
          type: discount.type,
          value: discount.value,
          minAmount: discount.minAmount,
          maxDiscount: discount.maxDiscount,
          priority: discount.priority,
          stackable: discount.stackable,
          active: discount.active,
          description: discount.description || '',
          startDateStr: this.formatDateTimeLocal(discount.startDate),
          endDateStr: this.formatDateTimeLocal(discount.endDate),
          applicableProductIds: discount.applicableProductIds || [],
          applicableCategory: discount.applicableCategory,
          excludeProductIds: discount.excludeProductIds || []
        }
      } else {
        this.resetForm()
      }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.editingDiscount = null
      this.resetForm()
    },
    resetForm() {
      const now = new Date()
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      
      this.formData = {
        name: '',
        type: 'percentage',
        value: '',
        minAmount: 0,
        maxDiscount: null,
        priority: 1,
        stackable: true,
        active: true,
        description: '',
        startDateStr: this.formatDateTimeLocal(now.toISOString()),
        endDateStr: this.formatDateTimeLocal(nextMonth.toISOString()),
        applicableProductIds: [],
        applicableCategory: null,
        excludeProductIds: []
      }
    },
    formatDateTimeLocal(isoString) {
      if (!isoString) return ''
      const date = new Date(isoString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    },
    async saveDiscount() {
      if (!this.formData.name || !this.formData.value) {
        this.showMessage('请填写优惠名称和优惠值', 'error')
        return
      }
      
      this.saving = true
      try {
        const data = {
          name: this.formData.name,
          type: this.formData.type,
          value: parseFloat(this.formData.value),
          minAmount: this.formData.minAmount || 0,
          maxDiscount: this.formData.maxDiscount || null,
          priority: this.formData.priority || 1,
          stackable: this.formData.stackable,
          active: this.formData.active,
          description: this.formData.description,
          startDate: this.formData.startDateStr 
            ? new Date(this.formData.startDateStr).toISOString() 
            : new Date().toISOString(),
          endDate: this.formData.endDateStr 
            ? new Date(this.formData.endDateStr).toISOString() 
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          applicableProductIds: this.formData.applicableProductIds,
          applicableCategory: this.formData.applicableCategory,
          excludeProductIds: this.formData.excludeProductIds
        }
        
        let response
        if (this.editingDiscount) {
          response = await discountApi.update(this.editingDiscount.id, data)
        } else {
          response = await discountApi.create(data)
        }
        
        if (response.data.success) {
          this.showMessage(
            this.editingDiscount ? '优惠更新成功' : '优惠创建成功',
            'success'
          )
          this.closeModal()
          await this.fetchDiscounts()
        } else {
          this.showMessage(response.data.message || '操作失败', 'error')
        }
      } catch (error) {
        console.error('保存优惠失败:', error)
        this.showMessage('保存优惠失败: ' + (error.response?.data?.message || error.message), 'error')
      } finally {
        this.saving = false
      }
    },
    async toggleActive(discount) {
      try {
        const response = await discountApi.update(discount.id, {
          active: !discount.active
        })
        
        if (response.data.success) {
          this.showMessage(
            discount.active ? '优惠已禁用' : '优惠已启用',
            'success'
          )
          await this.fetchDiscounts()
        } else {
          this.showMessage(response.data.message || '操作失败', 'error')
        }
      } catch (error) {
        console.error('更新优惠状态失败:', error)
        this.showMessage('操作失败: ' + (error.response?.data?.message || error.message), 'error')
      }
    },
    confirmDelete(discount) {
      if (confirm(`确定要删除优惠"${discount.name}"吗？`)) {
        this.deleteDiscount(discount)
      }
    },
    async deleteDiscount(discount) {
      try {
        const response = await discountApi.delete(discount.id)
        if (response.data.success) {
          this.showMessage('优惠删除成功', 'success')
          await this.fetchDiscounts()
        } else {
          this.showMessage(response.data.message || '删除失败', 'error')
        }
      } catch (error) {
        console.error('删除优惠失败:', error)
        this.showMessage('删除优惠失败: ' + (error.response?.data?.message || error.message), 'error')
      }
    },
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    showMessage(text, type = 'success') {
      this.message = text
      this.messageType = type
      setTimeout(() => {
        this.message = ''
      }, 3000)
    }
  }
}
</script>

<style scoped>
.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.discounts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.discount-card {
  display: flex;
  flex-direction: column;
}

.discount-header {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}

.discount-badge-wrapper {
  flex-shrink: 0;
}

.discount-badge {
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.25rem;
  color: white;
  text-align: center;
  min-width: 100px;
}

.discount-badge.percentage {
  background: linear-gradient(135deg, #4dabf7 0%, #228be6 100%);
}

.discount-badge.fixed {
  background: linear-gradient(135deg, #f06595 0%, #c2255c 100%);
}

.discount-badge.fullReduction {
  background: linear-gradient(135deg, #ff922b 0%, #e8590c 100%);
}

.discount-info {
  flex: 1;
}

.discount-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.discount-desc {
  color: #868e96;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
}

.discount-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.priority {
  color: #adb5bd;
  font-size: 0.9rem;
}

.discount-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.discount-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-item .label {
  color: #868e96;
  font-size: 0.9rem;
}

.detail-item .value {
  font-weight: 500;
  color: #495057;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.input-with-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hint {
  color: #868e96;
  font-size: 0.9rem;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .discount-header {
    flex-direction: column;
  }
  
  .discount-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .form-row {
    flex-direction: column;
  }
}
</style>