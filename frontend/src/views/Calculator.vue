<template>
  <div class="calculator-container">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="selection-card">
          <template #header>
            <div class="card-header">
              <span>选择商品</span>
            </div>
          </template>
          
          <div class="product-selection">
            <el-table
              v-loading="loading"
              :data="productList"
              style="width: 100%"
              @selection-change="handleProductSelectionChange"
            >
              <el-table-column type="selection" width="50" />
              <el-table-column prop="name" label="商品名称" min-width="180" />
              <el-table-column prop="category" label="品类" width="100">
                <template #default="scope">
                  <el-tag size="small">{{ scope.row.category || '未分类' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="price" label="单价" width="100">
                <template #default="scope">
                  <span class="price-text">¥{{ scope.row.price?.toFixed(2) || '0.00' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="购买数量" width="120">
                <template #default="scope">
                  <el-input-number
                    v-model="selectedQuantities[scope.row.id]"
                    :min="1"
                    :max="scope.row.stock || 999"
                    size="small"
                    @change="handleQuantityChange"
                  />
                </template>
              </el-table-column>
              <el-table-column label="小计" width="120">
                <template #default="scope">
                  <span class="subtotal-text">
                    ¥{{ (scope.row.price * (selectedQuantities[scope.row.id] || 1)).toFixed(2) }}
                  </span>
                </template>
              </el-table-column>
            </el-table>

            <div v-if="productList.length === 0 && !loading" class="empty-container">
              <el-icon class="empty-icon"><Box /></el-icon>
              <p>暂无商品数据，请先添加商品</p>
            </div>
          </div>
        </el-card>

        <el-card class="selection-card" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>选择优惠券</span>
              <el-tag type="info">可多选，将自动处理叠加和互斥规则</el-tag>
            </div>
          </template>
          
          <div class="coupon-selection">
            <el-checkbox-group v-model="selectedCouponIds" @change="handleCouponChange">
              <el-row :gutter="16">
                <template v-for="coupon in validCouponList" :key="coupon.id">
                  <el-col :span="12">
                    <el-checkbox :value="coupon.id" class="coupon-checkbox">
                      <div class="coupon-card-preview" :class="getCouponCardClass(coupon)">
                        <div class="coupon-left">
                          <div class="coupon-value">
                            {{ getCouponValue(coupon) }}
                          </div>
                          <div class="coupon-type">
                            {{ getCouponTypeName(coupon?.type) }}
                          </div>
                        </div>
                        <div class="coupon-divider"></div>
                        <div class="coupon-right">
                          <div class="coupon-name">{{ coupon?.name || '未命名' }}</div>
                          <div class="coupon-condition">{{ getCouponCondition(coupon) }}</div>
                          <div class="coupon-validity">
                            <el-tag
                              :type="getCouponStatusTag(coupon)"
                              size="small"
                              effect="dark"
                            >
                              {{ getCouponStatusName(coupon) }}
                            </el-tag>
                            <span v-if="coupon?.categoryRestrictions?.length" class="category-tag">
                              限: {{ coupon.categoryRestrictions.join(', ') }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </el-checkbox>
                  </el-col>
                </template>
              </el-row>
            </el-checkbox-group>

            <div v-if="validCouponList.length === 0 && !loading" class="empty-container">
              <el-icon class="empty-icon"><Ticket /></el-icon>
              <p>暂无优惠券数据，请先添加优惠券</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="result-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="result-icon"><Calculator /></el-icon>
              <span>计算结果</span>
            </div>
          </template>
          
          <div class="result-content">
            <div class="result-section">
              <div class="section-title">商品信息</div>
              <div v-if="selectedProducts.length === 0" class="empty-tip">
                请选择商品
              </div>
              <div v-else class="selected-products">
                <div v-for="item in selectedProducts" :key="item.id" class="selected-product-item">
                  <div class="product-info">
                    <div class="product-name">{{ item.name }}</div>
                    <div class="product-detail">
                      <span class="product-price">¥{{ item.price.toFixed(2) }}</span>
                      <span class="product-quantity">x {{ selectedQuantities[item.id] || 1 }}</span>
                    </div>
                  </div>
                  <div class="product-subtotal">
                    ¥{{ (item.price * (selectedQuantities[item.id] || 1)).toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="result-section">
              <div class="section-title">优惠券信息</div>
              <div v-if="selectedCouponIds.length === 0" class="empty-tip">
                请选择优惠券
              </div>
              <div v-else class="selected-coupons">
                <div
                  v-for="coupon in couponList.filter(c => selectedCouponIds.includes(c.id))"
                  :key="coupon.id"
                  class="selected-coupon-item"
                >
                  <div class="coupon-info">
                    <el-tag :type="getCouponTypeTag(coupon.type)" size="small">
                      {{ getCouponTypeName(coupon.type) }}
                    </el-tag>
                    <span class="coupon-name">{{ coupon.name }}</span>
                  </div>
                  <div class="coupon-value-small">
                    {{ getCouponValue(coupon) }}
                  </div>
                </div>
              </div>
            </div>

            <el-divider />

            <div class="price-summary">
              <div class="price-row">
                <span class="price-label">商品总价:</span>
                <span class="price-value">¥{{ totalOriginalPrice.toFixed(2) }}</span>
              </div>
              <div class="price-row" v-if="calculationResult">
                <span class="price-label">优惠金额:</span>
                <span class="price-value discount">-¥{{ calculationResult.totalDiscount?.toFixed(2) || '0.00' }}</span>
              </div>
              <div class="price-row final">
                <span class="price-label">应付金额:</span>
                <span class="price-value">¥{{ finalPrice.toFixed(2) }}</span>
              </div>
            </div>

            <el-button
              type="primary"
              :disabled="selectedProducts.length === 0"
              :loading="calculating"
              @click="handleCalculate"
              class="calculate-btn"
            >
              <el-icon><RefreshRight /></el-icon>
              计算优惠
            </el-button>

            <div v-if="calculationResult" class="discount-details">
              <el-divider content-position="left">优惠明细</el-divider>
              
              <div v-if="calculationResult.items?.length" class="items-breakdown">
                <div v-for="(item, index) in calculationResult.items" :key="index" class="item-breakdown">
                  <div class="item-name">{{ item.product.name }}</div>
                  <div class="item-prices">
                    <span class="original">原价: ¥{{ item.originalPrice.toFixed(2) }}</span>
                    <span class="arrow">→</span>
                    <span class="final">折后: ¥{{ item.finalPrice.toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <div v-if="calculationResult.items?.[0]?.applicableCoupons?.length" class="applied-coupons">
                <div class="detail-title">已应用的优惠券:</div>
                <div
                  v-for="coupon in calculationResult.items[0].applicableCoupons"
                  :key="coupon.id"
                  class="applied-coupon"
                >
                  <el-tag type="success" size="small">✓</el-tag>
                  <span>{{ coupon.name }}</span>
                </div>
              </div>

              <div v-if="calculationResult.items?.[0]?.nonApplicableCoupons?.length" class="non-applied-coupons">
                <div class="detail-title">未应用的优惠券:</div>
                <div
                  v-for="coupon in calculationResult.items[0].nonApplicableCoupons"
                  :key="coupon.id"
                  class="non-applied-coupon"
                >
                  <el-tag type="info" size="small">×</el-tag>
                  <span>{{ coupon.name }}</span>
                  <span class="reason">: {{ coupon.reason }}</span>
                </div>
              </div>

              <div v-if="calculationResult.items?.[0]?.discountDetails?.length" class="discount-breakdown">
                <div class="detail-title">折扣明细:</div>
                <div
                  v-for="(detail, index) in calculationResult.items[0].discountDetails"
                  :key="index"
                  class="discount-detail-item"
                >
                  <span class="detail-name">{{ detail.couponName }}</span>
                  <span class="detail-desc">{{ detail.discountDescription }}</span>
                  <span class="detail-amount">-¥{{ detail.discountAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const loading = ref(false)
const calculating = ref(false)
const productList = ref([])
const couponList = ref([])
const selectedProducts = ref([])
const selectedCouponIds = ref([])
const selectedQuantities = reactive({})
const calculationResult = ref(null)

const totalOriginalPrice = computed(() => {
  return selectedProducts.value.reduce((sum, item) => {
    if (!item || !item.id) return sum
    const quantity = selectedQuantities[item.id] || 1
    return sum + (item.price || 0) * quantity
  }, 0)
})

const finalPrice = computed(() => {
  if (calculationResult.value) {
    return calculationResult.value.totalFinalPrice || 0
  }
  return totalOriginalPrice.value
})

const validCouponList = computed(() => {
  return couponList.value.filter(coupon => {
    return coupon && coupon.id
  })
})

const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/products')
    if (response.data.success) {
      productList.value = response.data.data
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

const fetchCoupons = async () => {
  try {
    const response = await axios.get('/api/coupons')
    if (response.data.success) {
      couponList.value = response.data.data
    }
  } catch (error) {
    console.error('获取优惠券列表失败:', error)
    ElMessage.error('获取优惠券列表失败')
  }
}

const handleProductSelectionChange = (selection) => {
  selectedProducts.value = selection
  selection.forEach(item => {
    if (item && item.id && !selectedQuantities[item.id]) {
      selectedQuantities[item.id] = 1
    }
  })
}

const handleQuantityChange = () => {
  calculationResult.value = null
}

const handleCouponChange = () => {
  calculationResult.value = null
}

const handleCalculate = async () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请先选择商品')
    return
  }

  calculating.value = true
  calculationResult.value = null

  try {
    const items = selectedProducts.value
      .filter(product => product && product.id)
      .map(product => ({
        productId: product.id,
        quantity: selectedQuantities[product.id] || 1
      }))

    const response = await axios.post('/api/calculate/batch', {
      items,
      couponIds: selectedCouponIds.value
    })

    if (response.data.success) {
      calculationResult.value = response.data.data
      ElMessage.success('计算完成')
    }
  } catch (error) {
    console.error('计算失败:', error)
    ElMessage.error('计算失败')
  } finally {
    calculating.value = false
  }
}

const getCouponTypeName = (type) => {
  const names = {
    'fixed_amount': '满减券',
    'percentage': '折扣券',
    'free_shipping': '免邮券',
    'buy_x_get_y': '买X送Y'
  }
  return names[type] || type
}

const getCouponTypeTag = (type) => {
  const tags = {
    'fixed_amount': 'primary',
    'percentage': 'success',
    'free_shipping': 'warning',
    'buy_x_get_y': 'danger'
  }
  return tags[type] || 'info'
}

const getCouponCardClass = (coupon) => {
  if (!coupon) return ''
  const now = new Date()
  if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
    return 'expired'
  }
  if (coupon.status !== 'active') {
    return 'inactive'
  }
  return coupon.type || ''
}

const getCouponValue = (coupon) => {
  if (!coupon) return '-'
  switch (coupon.type) {
    case 'fixed_amount':
      const amount = coupon.amount || 0
      return `¥${amount}`
    case 'percentage':
      const percentage = coupon.percentage || 0
      return `${percentage}折`
    case 'free_shipping':
      return '免邮'
    case 'buy_x_get_y':
      const buyQty = coupon.buyQuantity || 1
      const getQty = coupon.getQuantity || 1
      return `买${buyQty}送${getQty}`
    default:
      return '-'
  }
}

const getCouponCondition = (coupon) => {
  if (!coupon) return '-'
  switch (coupon.type) {
    case 'fixed_amount':
    case 'percentage':
      const minAmount = coupon.minAmount || 0
      if (minAmount > 0) {
        return `满${minAmount}元可用`
      }
      return '无门槛'
    case 'free_shipping':
      return '免运费'
    case 'buy_x_get_y':
      const buyQty = coupon.buyQuantity || 1
      const getQty = coupon.getQuantity || 1
      return `买${buyQty}件送${getQty}件`
    default:
      return '-'
  }
}

const getCouponStatusName = (coupon) => {
  if (!coupon) return '未知'
  const now = new Date()
  if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
    return '已过期'
  }
  return coupon.status === 'active' ? '可用' : '停用'
}

const getCouponStatusTag = (coupon) => {
  if (!coupon) return 'info'
  const now = new Date()
  if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
    return 'danger'
  }
  return coupon.status === 'active' ? 'success' : 'info'
}

onMounted(() => {
  fetchProducts()
  fetchCoupons()
})
</script>

<style lang="scss" scoped>
.calculator-container {
  min-height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  
  .result-icon {
    margin-right: 8px;
    font-size: 18px;
  }
}

.selection-card {
  :deep(.el-card__body) {
    padding: 16px;
  }
}

.price-text {
  color: #f56c6c;
  font-weight: 600;
}

.subtotal-text {
  color: #67c23a;
  font-weight: 600;
}

.empty-container {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
}

.coupon-checkbox {
  width: 100%;
  margin: 0 0 16px 0;
  
  :deep(.el-checkbox__label) {
    width: 100%;
    padding-left: 10px;
  }
}

.coupon-card-preview {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 12px;
  color: #fff;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
  }
  
  &.fixed_amount {
    background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
  }
  
  &.percentage {
    background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
  }
  
  &.free_shipping {
    background: linear-gradient(135deg, #E6A23C 0%, #ebb563 100%);
  }
  
  &.buy_x_get_y {
    background: linear-gradient(135deg, #F56C6C 0%, #f78989 100%);
  }
  
  &.expired,
  &.inactive {
    background: linear-gradient(135deg, #909399 0%, #c0c4cc 100%);
    opacity: 0.7;
  }
  
  .coupon-left {
    text-align: center;
    padding-right: 12px;
    min-width: 60px;
    
    .coupon-value {
      font-size: 20px;
      font-weight: bold;
      line-height: 1.2;
    }
    
    .coupon-type {
      font-size: 12px;
      opacity: 0.9;
      margin-top: 4px;
    }
  }
  
  .coupon-divider {
    width: 1px;
    background: rgba(255, 255, 255, 0.3);
    margin: 4px 0;
  }
  
  .coupon-right {
    flex: 1;
    padding-left: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .coupon-name {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .coupon-condition {
      font-size: 12px;
      opacity: 0.9;
      margin-bottom: 6px;
    }
    
    .coupon-validity {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      
      .category-tag {
        font-size: 11px;
        opacity: 0.8;
      }
    }
  }
}

.result-card {
  position: sticky;
  top: 20px;
  
  :deep(.el-card__body) {
    padding: 20px;
  }
}

.result-content {
  .result-section {
    margin-bottom: 20px;
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ebeef5;
    }
    
    .empty-tip {
      color: #909399;
      font-size: 13px;
      text-align: center;
      padding: 20px;
    }
  }
  
  .selected-products {
    .selected-product-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px dashed #ebeef5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .product-info {
        .product-name {
          font-size: 14px;
          color: #303133;
        }
        
        .product-detail {
          display: flex;
          gap: 8px;
          margin-top: 4px;
          
          .product-price {
            color: #606266;
            font-size: 12px;
          }
          
          .product-quantity {
            color: #909399;
            font-size: 12px;
          }
        }
      }
      
      .product-subtotal {
        font-weight: 500;
        color: #303133;
      }
    }
  }
  
  .selected-coupons {
    .selected-coupon-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      
      .coupon-info {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .coupon-name {
          font-size: 13px;
          color: #303133;
        }
      }
      
      .coupon-value-small {
        font-size: 13px;
        font-weight: 500;
        color: #f56c6c;
      }
    }
  }
  
  .price-summary {
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      
      .price-label {
        font-size: 14px;
        color: #606266;
      }
      
      .price-value {
        font-size: 14px;
        color: #303133;
        
        &.discount {
          color: #67c23a;
        }
      }
      
      &.final {
        margin-top: 8px;
        padding-top: 12px;
        border-top: 1px solid #ebeef5;
        
        .price-label {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
        
        .price-value {
          font-size: 20px;
          font-weight: bold;
          color: #f56c6c;
        }
      }
    }
  }
  
  .calculate-btn {
    width: 100%;
    margin-top: 20px;
    height: 44px;
    font-size: 16px;
    font-weight: 500;
  }
  
  .discount-details {
    margin-top: 20px;
    
    .items-breakdown {
      .item-breakdown {
        padding: 8px 0;
        border-bottom: 1px dashed #ebeef5;
        
        .item-name {
          font-size: 13px;
          color: #303133;
          margin-bottom: 4px;
        }
        
        .item-prices {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .original {
            font-size: 12px;
            color: #909399;
            text-decoration: line-through;
          }
          
          .arrow {
            color: #606266;
          }
          
          .final {
            font-size: 12px;
            font-weight: 500;
            color: #f56c6c;
          }
        }
      }
    }
    
    .detail-title {
      font-size: 13px;
      font-weight: 500;
      color: #606266;
      margin: 12px 0 8px;
    }
    
    .applied-coupons,
    .non-applied-coupons {
      .applied-coupon,
      .non-applied-coupon {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 0;
        font-size: 12px;
        
        .reason {
          color: #909399;
        }
      }
    }
    
    .discount-breakdown {
      .discount-detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        font-size: 12px;
        
        .detail-name {
          color: #303133;
          font-weight: 500;
        }
        
        .detail-desc {
          color: #606266;
          flex: 1;
          margin-left: 8px;
        }
        
        .detail-amount {
          color: #f56c6c;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
