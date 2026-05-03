<template>
  <div class="product-manage">
    <div class="action-bar">
      <button class="btn btn-primary" @click="openModal()">
        + 添加商品
      </button>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="products.length === 0" class="empty-state">
      <div class="empty-state-icon">📦</div>
      <h3>暂无商品</h3>
      <p>点击上方按钮添加第一个商品</p>
    </div>
    
    <div v-else class="card">
      <table class="table">
        <thead>
          <tr>
            <th>商品名称</th>
            <th>分类</th>
            <th>价格</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>
              <div class="product-name-cell">
                <img 
                  :src="product.image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=小型商品图标%20灰色&image_size=square'" 
                  :alt="product.name"
                />
                <span>{{ product.name }}</span>
              </div>
            </td>
            <td>
              <span class="badge badge-info">{{ product.category }}</span>
            </td>
            <td>
              <span class="price">¥{{ product.price.toFixed(2) }}</span>
            </td>
            <td>{{ formatDate(product.createdAt) }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn btn-secondary" @click="viewProduct(product.id)">
                  预览
                </button>
                <button class="btn btn-success" @click="openModal(product)">
                  编辑
                </button>
                <button class="btn btn-danger" @click="confirmDelete(product)">
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
          <h3 class="modal-title">{{ editingProduct ? '编辑商品' : '添加商品' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveProduct">
            <div class="form-group">
              <label class="form-label">商品名称 *</label>
              <input 
                type="text" 
                v-model="formData.name" 
                class="form-input"
                placeholder="请输入商品名称"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">商品描述</label>
              <textarea 
                v-model="formData.description" 
                class="form-textarea"
                placeholder="请输入商品描述"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label class="form-label">价格 *</label>
              <input 
                type="number" 
                v-model.number="formData.price" 
                class="form-input"
                placeholder="请输入商品价格"
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">商品分类</label>
              <input 
                type="text" 
                v-model="formData.category" 
                class="form-input"
                placeholder="请输入商品分类"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">商品图片URL</label>
              <input 
                type="text" 
                v-model="formData.image" 
                class="form-input"
                placeholder="请输入商品图片URL"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">规格类型（用逗号分隔）</label>
              <input 
                type="text" 
                v-model="specsInput" 
                class="form-input"
                placeholder="例如：颜色,尺寸,内存"
              />
              <small>创建商品后可在SKU管理中添加具体规格值</small>
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
import { productApi } from '@/api'

export default {
  name: 'ProductManage',
  data() {
    return {
      products: [],
      loading: true,
      showModal: false,
      editingProduct: null,
      saving: false,
      message: '',
      messageType: 'success',
      formData: {
        name: '',
        description: '',
        price: '',
        category: '默认分类',
        image: '',
        specs: []
      },
      specsInput: ''
    }
  },
  async created() {
    await this.fetchProducts()
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
      } finally {
        this.loading = false
      }
    },
    openModal(product = null) {
      this.editingProduct = product
      if (product) {
        this.formData = {
          name: product.name,
          description: product.description || '',
          price: product.price,
          category: product.category || '默认分类',
          image: product.image || '',
          specs: product.specs || []
        }
        this.specsInput = (product.specs || []).join(',')
      } else {
        this.resetForm()
      }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.editingProduct = null
      this.resetForm()
    },
    resetForm() {
      this.formData = {
        name: '',
        description: '',
        price: '',
        category: '默认分类',
        image: '',
        specs: []
      }
      this.specsInput = ''
    },
    async saveProduct() {
      if (!this.formData.name || !this.formData.price) {
        this.showMessage('请填写商品名称和价格', 'error')
        return
      }
      
      this.saving = true
      try {
        const specs = this.specsInput
          ? this.specsInput.split(',').map(s => s.trim()).filter(s => s)
          : []
        
        const data = {
          ...this.formData,
          specs
        }
        
        let response
        if (this.editingProduct) {
          response = await productApi.update(this.editingProduct.id, data)
        } else {
          response = await productApi.create(data)
        }
        
        if (response.data.success) {
          this.showMessage(
            this.editingProduct ? '商品更新成功' : '商品创建成功',
            'success'
          )
          this.closeModal()
          await this.fetchProducts()
        } else {
          this.showMessage(response.data.message || '操作失败', 'error')
        }
      } catch (error) {
        console.error('保存商品失败:', error)
        this.showMessage('保存商品失败: ' + (error.response?.data?.message || error.message), 'error')
      } finally {
        this.saving = false
      }
    },
    confirmDelete(product) {
      if (confirm(`确定要删除商品"${product.name}"吗？`)) {
        this.deleteProduct(product)
      }
    },
    async deleteProduct(product) {
      try {
        const response = await productApi.delete(product.id)
        if (response.data.success) {
          this.showMessage('商品删除成功', 'success')
          await this.fetchProducts()
        } else {
          this.showMessage(response.data.message || '删除失败', 'error')
        }
      } catch (error) {
        console.error('删除商品失败:', error)
        this.showMessage('删除商品失败: ' + (error.response?.data?.message || error.message), 'error')
      }
    },
    viewProduct(productId) {
      this.$router.push(`/product/${productId}`)
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

.product-name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.product-name-cell img {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  background: #f8f9fa;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-buttons .btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}
</style>