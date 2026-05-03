<template>
  <div class="sku-manage">
    <div class="action-bar">
      <div class="filter-section">
        <label class="form-label">选择商品：</label>
        <select v-model="selectedProductId" class="form-select" style="width: 250px;" @change="onProductChange">
          <option value="">-- 全部商品 --</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>
      </div>
      <button class="btn btn-primary" @click="openModal()" :disabled="!products.length">
        + 添加SKU
      </button>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="skus.length === 0" class="empty-state">
      <div class="empty-state-icon">🏷️</div>
      <h3>暂无SKU</h3>
      <p>选择商品后点击"添加SKU"按钮创建规格</p>
    </div>
    
    <div v-else class="card">
      <table class="table">
        <thead>
          <tr>
            <th>商品</th>
            <th>规格组合</th>
            <th>价格</th>
            <th>库存</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sku in skus" :key="sku.id">
            <td>{{ getProductName(sku.productId) }}</td>
            <td>
              <div class="specs-display">
                <span 
                  v-for="spec in sku.specs" 
                  :key="`${spec.name}-${spec.value}`"
                  class="badge badge-info"
                  style="margin-right: 0.25rem; margin-bottom: 0.25rem;"
                >
                  {{ spec.name }}: {{ spec.value }}
                </span>
              </div>
            </td>
            <td>
              <span class="price">¥{{ sku.price.toFixed(2) }}</span>
            </td>
            <td>
              <span :class="[
                'badge',
                sku.stock === 0 ? 'badge-danger' : 
                sku.stock <= 10 ? 'badge-warning' : 'badge-success'
              ]">
                {{ sku.stock }} 件
              </span>
            </td>
            <td>{{ formatDate(sku.createdAt) }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn btn-success" @click="openStockModal(sku)">
                  改库存
                </button>
                <button class="btn btn-secondary" @click="openModal(sku)">
                  编辑
                </button>
                <button class="btn btn-danger" @click="confirmDelete(sku)">
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingSku ? '编辑SKU' : '添加SKU' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveSku">
            <div class="form-group">
              <label class="form-label">所属商品 *</label>
              <select v-model="formData.productId" class="form-select" required :disabled="!!editingSku">
                <option value="">请选择商品</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">规格设置 *</label>
              <div class="specs-form">
                <div v-for="(spec, index) in formData.specs" :key="index" class="spec-item">
                  <input 
                    type="text" 
                    v-model="spec.name" 
                    class="form-input"
                    placeholder="规格名称"
                    style="width: 120px;"
                  />
                  <span style="padding: 0 0.5rem;">:</span>
                  <input 
                    type="text" 
                    v-model="spec.value" 
                    class="form-input"
                    placeholder="规格值"
                    style="width: 150px;"
                  />
                  <button 
                    type="button" 
                    class="btn btn-danger" 
                    style="padding: 0.4rem 0.8rem; margin-left: 0.5rem;"
                    @click="removeSpec(index)"
                  >
                    ×
                  </button>
                </div>
                <button 
                  type="button" 
                  class="btn btn-secondary" 
                  style="margin-top: 0.75rem;"
                  @click="addSpec"
                >
                  + 添加规格项
                </button>
              </div>
              <small style="color: #868e96;">每个SKU的规格组合必须唯一，例如：颜色:红色,尺寸:M</small>
            </div>
            
            <div class="form-group">
              <label class="form-label">价格 *</label>
              <input 
                type="number" 
                v-model.number="formData.price" 
                class="form-input"
                placeholder="请输入SKU价格"
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">库存 *</label>
              <input 
                type="number" 
                v-model.number="formData.stock" 
                class="form-input"
                placeholder="请输入库存数量"
                min="0"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">SKU图片URL</label>
              <input 
                type="text" 
                v-model="formData.image" 
                class="form-input"
                placeholder="可选：SKU专属图片"
              />
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
    
    <div v-if="showStockModal" class="modal-overlay" @click.self="closeStockModal">
      <div class="modal" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title">修改库存</h3>
          <button class="modal-close" @click="closeStockModal">&times;</button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 1rem;">
            <p><strong>规格：</strong>{{ stockSkuSpecs }}</p>
            <p><strong>当前库存：</strong>{{ stockForm.currentStock }} 件</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">操作类型</label>
            <select v-model="stockForm.operation" class="form-select">
              <option value="set">设置为</option>
              <option value="add">增加</option>
              <option value="reduce">减少</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">数量</label>
            <input 
              type="number" 
              v-model.number="stockForm.stock" 
              class="form-input"
              min="0"
              required
            />
          </div>
          
          <div class="modal-footer" style="padding: 1rem 0 0 0;">
            <button type="button" class="btn btn-secondary" @click="closeStockModal">
              取消
            </button>
            <button type="button" class="btn btn-primary" @click="updateStock" :disabled="savingStock">
              {{ savingStock ? '更新中...' : '确认' }}
            </button>
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
import { productApi, skuApi } from '@/api'

export default {
  name: 'SkuManage',
  data() {
    return {
      products: [],
      skus: [],
      loading: true,
      selectedProductId: '',
      showModal: false,
      editingSku: null,
      saving: false,
      message: '',
      messageType: 'success',
      formData: {
        productId: '',
        specs: [{ name: '', value: '' }],
        price: '',
        stock: 0,
        image: ''
      },
      showStockModal: false,
      stockSku: null,
      savingStock: false,
      stockForm: {
        operation: 'set',
        stock: 0,
        currentStock: 0
      }
    }
  },
  computed: {
    stockSkuSpecs() {
      if (!this.stockSku || !this.stockSku.specs) return '-'
      return this.stockSku.specs.map(s => `${s.name}:${s.value}`).join(', ')
    }
  },
  async created() {
    await Promise.all([
      this.fetchProducts(),
      this.fetchSkus()
    ])
  },
  methods: {
    async fetchProducts() {
      try {
        const response = await productApi.getAll()
        if (response.data.success) {
          this.products = response.data.data
        }
      } catch (error) {
        console.error('获取商品列表失败:', error)
        this.products = []
      }
    },
    async fetchSkus() {
      this.loading = true
      try {
        let response
        if (this.selectedProductId) {
          response = await skuApi.getByProductId(this.selectedProductId)
        } else {
          response = await skuApi.getAll()
        }
        
        if (response.data.success) {
          this.skus = response.data.data
        }
      } catch (error) {
        console.error('获取SKU列表失败:', error)
        this.skus = []
      } finally {
        this.loading = false
      }
    },
    onProductChange() {
      this.fetchSkus()
    },
    getProductName(productId) {
      const product = this.products.find(p => p.id === productId)
      return product ? product.name : '未知商品'
    },
    openModal(sku = null) {
      this.editingSku = sku
      if (sku) {
        this.formData = {
          productId: sku.productId,
          specs: [...sku.specs],
          price: sku.price,
          stock: sku.stock,
          image: sku.image || ''
        }
      } else {
        this.resetForm()
        if (this.selectedProductId) {
          this.formData.productId = this.selectedProductId
        }
      }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.editingSku = null
      this.resetForm()
    },
    resetForm() {
      this.formData = {
        productId: '',
        specs: [{ name: '', value: '' }],
        price: '',
        stock: 0,
        image: ''
      }
    },
    addSpec() {
      this.formData.specs.push({ name: '', value: '' })
    },
    removeSpec(index) {
      if (this.formData.specs.length > 1) {
        this.formData.specs.splice(index, 1)
      }
    },
    async saveSku() {
      if (!this.formData.productId) {
        this.showMessage('请选择所属商品', 'error')
        return
      }
      
      const validSpecs = this.formData.specs.filter(s => s.name && s.value)
      if (validSpecs.length === 0) {
        this.showMessage('请至少填写一个规格项', 'error')
        return
      }
      
      if (this.formData.price === '' || this.formData.price === null) {
        this.showMessage('请输入价格', 'error')
        return
      }
      
      this.saving = true
      try {
        const data = {
          ...this.formData,
          specs: validSpecs
        }
        
        let response
        if (this.editingSku) {
          response = await skuApi.update(this.editingSku.id, data)
        } else {
          response = await skuApi.create(data)
        }
        
        if (response.data.success) {
          this.showMessage(
            this.editingSku ? 'SKU更新成功' : 'SKU创建成功',
            'success'
          )
          this.closeModal()
          await this.fetchSkus()
        } else {
          this.showMessage(response.data.message || '操作失败', 'error')
        }
      } catch (error) {
        console.error('保存SKU失败:', error)
        this.showMessage('保存SKU失败: ' + (error.response?.data?.message || error.message), 'error')
      } finally {
        this.saving = false
      }
    },
    openStockModal(sku) {
      this.stockSku = sku
      this.stockForm = {
        operation: 'set',
        stock: sku.stock,
        currentStock: sku.stock
      }
      this.showStockModal = true
    },
    closeStockModal() {
      this.showStockModal = false
      this.stockSku = null
    },
    async updateStock() {
      if (!this.stockSku) return
      
      this.savingStock = true
      try {
        const response = await skuApi.updateStock(this.stockSku.id, {
          operation: this.stockForm.operation,
          stock: this.stockForm.stock
        })
        
        if (response.data.success) {
          this.showMessage('库存更新成功', 'success')
          this.closeStockModal()
          await this.fetchSkus()
        } else {
          this.showMessage(response.data.message || '更新失败', 'error')
        }
      } catch (error) {
        console.error('更新库存失败:', error)
        this.showMessage('更新库存失败: ' + (error.response?.data?.message || error.message), 'error')
      } finally {
        this.savingStock = false
      }
    },
    confirmDelete(sku) {
      const specs = sku.specs.map(s => `${s.name}:${s.value}`).join(', ')
      if (confirm(`确定要删除SKU"${specs}"吗？`)) {
        this.deleteSku(sku)
      }
    },
    async deleteSku(sku) {
      try {
        const response = await skuApi.delete(sku.id)
        if (response.data.success) {
          this.showMessage('SKU删除成功', 'success')
          await this.fetchSkus()
        } else {
          this.showMessage(response.data.message || '删除失败', 'error')
        }
      } catch (error) {
        console.error('删除SKU失败:', error)
        this.showMessage('删除SKU失败: ' + (error.response?.data?.message || error.message), 'error')
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-section .form-label {
  margin-bottom: 0;
  font-weight: 500;
}

.specs-display {
  display: flex;
  flex-wrap: wrap;
}

.specs-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.spec-item {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-buttons .btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}
</style>