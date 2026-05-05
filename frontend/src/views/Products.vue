<template>
  <div class="products-container">
    <el-card class="stats-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon primary">
              <el-icon><Goods /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">商品总数</div>
              <div class="stat-value">{{ totalProducts }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon success">
              <el-icon><Coin /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">总价值</div>
              <div class="stat-value">¥{{ totalValue }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon warning">
              <el-icon><Collection /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">品类数量</div>
              <div class="stat-value">{{ categoryCount }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon danger">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">平均价格</div>
              <div class="stat-value">¥{{ avgPrice }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>商品列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增商品
          </el-button>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="productList"
        style="width: 100%"
        stripe
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="商品名称" min-width="200" />
        <el-table-column prop="category" label="品类" width="120">
          <template #default="scope">
            <el-tag size="small">{{ scope.row.category || '未分类' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="单价" width="120">
          <template #default="scope">
            <span class="price-text">¥{{ scope.row.price?.toFixed(2) || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100">
          <template #default="scope">
            <el-tag :type="getStockTagType(scope.row.stock)" size="small">
              {{ scope.row.stock || 0 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="创建时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-if="productList.length === 0 && !loading" class="empty-container">
        <el-icon class="empty-icon"><Box /></el-icon>
        <p>暂无商品数据</p>
        <el-button type="primary" @click="handleAdd" style="margin-top: 16px">
          立即添加
        </el-button>
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '新增商品'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        v-loading="submitLoading"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入商品名称"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品品类" prop="category">
              <el-select
                v-model="formData.category"
                placeholder="请选择或输入品类"
                style="width: 100%"
                filterable
                allow-create
                default-first-option
              >
                <el-option
                  v-for="cat in categoryOptions"
                  :key="cat"
                  :label="cat"
                  :value="cat"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品单价" prop="price">
              <el-input-number
                v-model="formData.price"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入单价"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="库存数量" prop="stock">
          <el-input-number
            v-model="formData.stock"
            :min="0"
            style="width: 100%"
            placeholder="请输入库存数量"
          />
        </el-form-item>

        <el-form-item label="商品描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const productList = ref([])

const defaultFormData = {
  id: '',
  name: '',
  category: '',
  price: 0,
  stock: 0,
  description: ''
}

const formData = reactive({ ...defaultFormData })

const formRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择商品品类', trigger: 'change' }],
  price: [{ required: true, message: '请输入商品单价', trigger: 'blur' }]
}

const totalProducts = computed(() => productList.value.length)

const totalValue = computed(() => {
  return productList.value.reduce((sum, item) => {
    if (!item) return sum
    return sum + (item.price || 0) * (item.stock || 0)
  }, 0).toFixed(2)
})

const categoryCount = computed(() => {
  const categories = new Set()
  productList.value.forEach(item => {
    if (item && item.category) {
      categories.add(item.category)
    }
  })
  return categories.size
})

const avgPrice = computed(() => {
  if (productList.value.length === 0) return '0.00'
  const validProducts = productList.value.filter(item => item && item.price !== undefined && item.price !== null)
  if (validProducts.length === 0) return '0.00'
  const total = validProducts.reduce((sum, item) => sum + (item.price || 0), 0)
  return (total / validProducts.length).toFixed(2)
})

const categoryOptions = computed(() => {
  const categories = new Set()
  productList.value.forEach(product => {
    if (product && product.category) {
      categories.add(product.category)
    }
  })
  return Array.from(categories)
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

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, { ...defaultFormData })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品"${row.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await axios.delete(`/api/products/${row.id}`)
    if (response.data.success) {
      ElMessage.success('删除成功')
      fetchProducts()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const data = { ...formData }
        if (data.id) {
          delete data.id
        }
        
        let response
        if (isEdit.value && formData.id) {
          response = await axios.put(`/api/products/${formData.id}`, data)
        } else {
          response = await axios.post('/api/products', data)
        }
        
        if (response.data.success) {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          fetchProducts()
        }
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('提交失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const getStockTagType = (stock) => {
  if (stock === undefined || stock === null) return 'info'
  if (stock === 0) return 'danger'
  if (stock < 10) return 'warning'
  return 'success'
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  fetchProducts()
})
</script>

<style lang="scss" scoped>
.products-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card {
  :deep(.el-card__body) {
    padding: 20px;
  }
}

.table-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
  
  .empty-container {
    text-align: center;
    padding: 60px 20px;
    color: #909399;
    
    .empty-icon {
      font-size: 60px;
      margin-bottom: 16px;
    }
    
    p {
      margin: 0;
      font-size: 14px;
    }
  }
}

.price-text {
  color: #f56c6c;
  font-weight: 600;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
  
  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    
    &.primary {
      background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
      color: #fff;
    }
    
    &.success {
      background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
      color: #fff;
    }
    
    &.warning {
      background: linear-gradient(135deg, #E6A23C 0%, #ebb563 100%);
      color: #fff;
    }
    
    &.danger {
      background: linear-gradient(135deg, #F56C6C 0%, #f78989 100%);
      color: #fff;
    }
  }
  
  .stat-content {
    .stat-title {
      font-size: 14px;
      color: #909399;
      margin-bottom: 4px;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }
  }
}
</style>
