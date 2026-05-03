<template>
  <div class="product-detail">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="!product" class="empty-state">
      <div class="empty-state-icon">❓</div>
      <h3>商品不存在</h3>
      <p>该商品可能已被删除</p>
      <router-link to="/" class="btn btn-primary">
        返回商品列表
      </router-link>
    </div>
    
    <div v-else class="detail-content">
      <div class="product-main">
        <div class="product-gallery">
          <div class="main-image">
            <img 
              :src="currentImage || (product.image && product.image.trim() ? product.image : defaultPlaceholder)" 
              :alt="product.name"
            />
          </div>
        </div>
        
        <div class="product-info">
          <div class="product-header">
            <span class="badge badge-info">{{ product.category }}</span>
            <h1 class="product-title">{{ product.name }}</h1>
            <p class="product-description">{{ product.description || '暂无描述' }}</p>
          </div>
          
          <div class="price-section">
            <div v-if="selectedSku" class="current-price">
              <span class="price">¥{{ selectedSku.price.toFixed(2) }}</span>
              <span v-if="selectedSku.price < product.price" class="price-original">
                ¥{{ product.price.toFixed(2) }}
              </span>
            </div>
            <div v-else class="current-price">
              <span class="price">¥{{ product.price.toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="spec-section" v-if="product.skus && product.skus.length > 0">
            <h3 class="section-title">规格选择</h3>
            
            <div 
              v-for="specGroup in specGroups" 
              :key="specGroup.name" 
              class="spec-group"
            >
              <div class="spec-title">{{ specGroup.name }}</div>
              <div class="spec-options">
                <button
                  v-for="option in specGroup.values"
                  :key="option.value"
                  :class="[
                    'spec-option',
                    { selected: option.selected },
                    { disabled: !option.available }
                  ]"
                  @click="selectSpec(specGroup.name, option.value)"
                  :disabled="!option.available"
                >
                  {{ option.value }}
                </button>
              </div>
            </div>
            
            <div v-if="selectedSku" class="selection-summary">
              <div class="summary-item">
                <span class="label">已选择：</span>
                <span class="value">{{ selectedSpecsDisplay }}</span>
              </div>
              <div class="summary-item">
                <span class="label">库存：</span>
                <span :class="[
                  'value',
                  { 'out-of-stock': selectedSku.stock === 0 }
                ]">
                  {{ selectedSku.stock > 0 ? `剩余 ${selectedSku.stock} 件` : '暂无库存' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="quantity-section">
            <h3 class="section-title">购买数量</h3>
            <div class="quantity-selector">
              <button 
                class="quantity-btn" 
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
              >
                -
              </button>
              <input 
                type="number" 
                v-model.number="quantity" 
                class="quantity-input"
                min="1"
                :max="selectedSku?.stock || 999"
              />
              <button 
                class="quantity-btn" 
                @click="increaseQuantity"
                :disabled="selectedSku && quantity >= selectedSku.stock"
              >
                +
              </button>
              <span class="stock-hint" v-if="selectedSku">
                (最多可买 {{ selectedSku.stock }} 件)
              </span>
            </div>
          </div>
          
          <div class="action-section">
            <button 
              class="btn btn-primary btn-large"
              @click="addToCart"
              :disabled="!canAddToCart"
            >
              {{ addToCartButtonText }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="discount-section" v-if="activeDiscounts.length > 0">
        <h3 class="section-title">可用优惠</h3>
        <div class="discount-list">
          <div 
            v-for="discount in activeDiscounts" 
            :key="discount.id" 
            class="discount-item"
          >
            <div class="discount-badge" :class="discount.type">
              {{ getDiscountBadge(discount) }}
            </div>
            <div class="discount-info">
              <div class="discount-name">{{ discount.name }}</div>
              <div class="discount-desc">{{ getDiscountDesc(discount) }}</div>
              <div class="discount-meta">
                <span v-if="!discount.stackable" class="badge badge-warning">
                  不可叠加
                </span>
                <span class="discount-time">
                  {{ formatDate(discount.startDate) }} - {{ formatDate(discount.endDate) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="selectedSku && quantity > 0" class="discount-calculation">
          <h4>优惠计算（{{ quantity }}件）</h4>
          <button 
            class="btn btn-secondary" 
            @click="calculateDiscount"
            :disabled="calculating"
          >
            {{ calculating ? '计算中...' : '计算优惠' }}
          </button>
          
          <div v-if="calculationResult" class="calculation-result">
            <div class="result-item">
              <span class="label">商品总价：</span>
              <span class="value">¥{{ calculationResult.subtotal.toFixed(2) }}</span>
            </div>
            <div class="result-item discount">
              <span class="label">优惠金额：</span>
              <span class="value">-¥{{ calculationResult.totalDiscount.toFixed(2) }}</span>
            </div>
            <div class="result-item final">
              <span class="label">实付金额：</span>
              <span class="value">¥{{ calculationResult.finalPrice.toFixed(2) }}</span>
            </div>
            
            <div v-if="calculationResult.appliedDiscounts.length > 0" class="applied-discounts">
              <h5>已应用优惠：</h5>
              <ul>
                <li v-for="d in calculationResult.appliedDiscounts" :key="d.id">
                  {{ d.name }}：-¥{{ d.discountAmount.toFixed(2) }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { productApi, skuApi, discountApi } from '@/api'

export default {
  name: 'ProductDetail',
  data() {
    return {
      product: null,
      skus: [],
      loading: true,
      selectedSpecs: [],
      specGroups: [],
      selectedSku: null,
      quantity: 1,
      activeDiscounts: [],
      calculating: false,
      calculationResult: null,
      message: '',
      messageType: 'success',
      defaultPlaceholder: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=电商商品%20默认图片%20灰色背景%20product%20placeholder&image_size=square'
    }
  },
  computed: {
    currentImage() {
      return this.selectedSku?.image || null
    },
    selectedSpecsDisplay() {
      if (this.selectedSpecs.length === 0) return '请选择规格'
      return this.selectedSpecs.map(s => `${s.name}: ${s.value}`).join('，')
    },
    canAddToCart() {
      return this.selectedSku && 
             this.selectedSku.stock > 0 && 
             this.quantity > 0 && 
             this.quantity <= this.selectedSku.stock
    },
    addToCartButtonText() {
      if (!this.selectedSku) {
        return '请选择规格'
      }
      if (this.selectedSku.stock === 0) {
        return '暂无库存'
      }
      if (this.quantity > this.selectedSku.stock) {
        return `超过库存限制（最多${this.selectedSku.stock}件）`
      }
      return '加入购物车'
    }
  },
  async created() {
    await this.fetchProduct()
    await this.fetchActiveDiscounts()
  },
  watch: {
    selectedSku(newSku, oldSku) {
      if (newSku && this.quantity > newSku.stock) {
        this.quantity = newSku.stock > 0 ? newSku.stock : 1
      }
    },
    quantity(newQty, oldQty) {
      if (newQty !== parseInt(newQty, 10) || newQty < 1) {
        this.quantity = 1
        return
      }
      
      if (this.selectedSku && newQty > this.selectedSku.stock) {
        this.quantity = this.selectedSku.stock
        this.showMessage(`库存不足，最多只能购买 ${this.selectedSku.stock} 件`, 'error')
      }
    }
  },
  methods: {
    async fetchProduct() {
      const productId = this.$route.params.id
      try {
        const response = await productApi.getById(productId)
        if (response.data.success) {
          this.product = response.data.data
          this.skus = this.product.skus || []
          this.initSpecGroups()
        }
      } catch (error) {
        console.error('获取商品详情失败:', error)
        this.product = null
      } finally {
        this.loading = false
      }
    },
    async fetchActiveDiscounts() {
      try {
        const response = await discountApi.getAll()
        if (response.data.success) {
          const now = new Date()
          this.activeDiscounts = response.data.data.filter(d => {
            const start = new Date(d.startDate)
            const end = new Date(d.endDate)
            return d.active && start <= now && end >= now
          })
        }
      } catch (error) {
        console.error('获取优惠列表失败:', error)
        this.activeDiscounts = []
      }
    },
    initSpecGroups() {
      if (this.skus.length === 0) return
      
      const specTypes = new Set()
      this.skus.forEach(sku => {
        sku.specs.forEach(spec => {
          specTypes.add(spec.name)
        })
      })
      
      this.specGroups = Array.from(specTypes).map(type => {
        const values = new Set()
        this.skus.forEach(sku => {
          sku.specs.forEach(spec => {
            if (spec.name === type) {
              values.add(spec.value)
            }
          })
        })
        
        return {
          name: type,
          values: Array.from(values).map(value => ({
            value,
            available: true,
            selected: false
          }))
        }
      })
      
      this.updateAvailableSpecs()
    },
    selectSpec(specName, value) {
      const existingIndex = this.selectedSpecs.findIndex(s => s.name === specName)
      
      if (existingIndex !== -1) {
        if (this.selectedSpecs[existingIndex].value === value) {
          this.selectedSpecs.splice(existingIndex, 1)
        } else {
          this.selectedSpecs[existingIndex].value = value
        }
      } else {
        this.selectedSpecs.push({ name: specName, value })
      }
      
      this.updateAvailableSpecs()
      this.updateSelectedSku()
    },
    updateAvailableSpecs() {
      this.specGroups.forEach(specGroup => {
        specGroup.values.forEach(option => {
          option.selected = this.selectedSpecs.some(
            s => s.name === specGroup.name && s.value === option.value
          )
          
          const testSpecs = this.selectedSpecs
            .filter(s => s.name !== specGroup.name)
            .concat({ name: specGroup.name, value: option.value })
          
          const hasMatchingSku = this.skus.some(sku => {
            return testSpecs.every(testSpec => 
              sku.specs.some(spec => 
                spec.name === testSpec.name && spec.value === testSpec.value
              )
            ) && sku.stock > 0
          })
          
          option.available = hasMatchingSku
        })
      })
    },
    updateSelectedSku() {
      if (this.selectedSpecs.length === 0) {
        this.selectedSku = null
        return
      }
      
      this.selectedSku = this.skus.find(sku => {
        return this.selectedSpecs.every(selectedSpec => 
          sku.specs.some(spec => 
            spec.name === selectedSpec.name && spec.value === selectedSpec.value
          )
        )
      }) || null
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--
      }
    },
    increaseQuantity() {
      if (!this.selectedSku || this.quantity < this.selectedSku.stock) {
        this.quantity++
      }
    },
    async addToCart() {
      if (!this.canAddToCart) return
      
      this.showMessage('商品已加入购物车！', 'success')
    },
    async calculateDiscount() {
      if (!this.selectedSku || this.quantity <= 0) return
      
      this.calculating = true
      try {
        const response = await discountApi.calculate({
          items: [
            {
              skuId: this.selectedSku.id,
              quantity: this.quantity
            }
          ]
        })
        
        if (response.data.success) {
          this.calculationResult = response.data.data
        }
      } catch (error) {
        console.error('计算优惠失败:', error)
        this.showMessage('计算优惠失败', 'error')
      } finally {
        this.calculating = false
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
          return `立减${discount.value}元${discount.minAmount ? `（满${discount.minAmount}元可用）` : ''}`
        case 'fullReduction':
          return `满${discount.minAmount}元减${discount.value}元`
        default:
          return discount.description || ''
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
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
.product-detail {
  position: relative;
}

.detail-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.product-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.product-gallery {
  position: sticky;
  top: 2rem;
}

.main-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #f8f9fa;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-header {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.product-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 1rem 0;
  line-height: 1.4;
}

.product-description {
  color: #868e96;
  font-size: 1rem;
  line-height: 1.6;
}

.price-section {
  padding: 1.5rem;
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  border-radius: 12px;
  border: 1px solid #ffe3e3;
}

.current-price {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.current-price .price {
  font-size: 2.5rem;
}

.spec-section {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 1rem;
}

.selection-summary {
  margin-top: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.summary-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item .label {
  color: #868e96;
  margin-right: 0.5rem;
}

.summary-item .value {
  font-weight: 500;
}

.summary-item .value.out-of-stock {
  color: #fa5252;
}

.quantity-section {
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.stock-hint {
  color: #868e96;
  font-size: 0.9rem;
}

.action-section {
  padding-top: 1rem;
}

.btn-large {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
}

.discount-section {
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.discount-list {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.discount-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.discount-item:hover {
  background: #e9ecef;
}

.discount-badge {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
}

.discount-badge.percentage {
  background: #4dabf7;
  color: white;
}

.discount-badge.fixed {
  background: #f06595;
  color: white;
}

.discount-badge.fullReduction {
  background: #ff922b;
  color: white;
}

.discount-info {
  flex: 1;
}

.discount-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.discount-desc {
  font-size: 0.9rem;
  color: #868e96;
  margin-bottom: 0.5rem;
}

.discount-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.discount-time {
  font-size: 0.85rem;
  color: #adb5bd;
}

.discount-calculation {
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.discount-calculation h4 {
  margin-bottom: 1rem;
  color: #495057;
}

.calculation-result {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #e3fafc 0%, #f8f9fa 100%);
  border-radius: 8px;
  border: 1px solid #c5f6fa;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px dashed #dee2e6;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item .label {
  color: #868e96;
}

.result-item .value {
  font-weight: 600;
  font-size: 1.1rem;
}

.result-item.discount .value {
  color: #fa5252;
}

.result-item.final .value {
  color: #667eea;
  font-size: 1.4rem;
}

.applied-discounts {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #dee2e6;
}

.applied-discounts h5 {
  margin-bottom: 0.5rem;
  color: #495057;
  font-size: 0.95rem;
}

.applied-discounts ul {
  list-style: none;
}

.applied-discounts li {
  padding: 0.25rem 0;
  color: #868e96;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .product-main {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .product-gallery {
    position: static;
  }
  
  .product-title {
    font-size: 1.5rem;
  }
  
  .current-price .price {
    font-size: 2rem;
  }
}
</style>