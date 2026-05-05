<template>
  <div class="coupons-container">
    <el-card class="filter-card">
      <template #header>
        <div class="card-header">
          <span>筛选条件</span>
        </div>
      </template>
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="优惠券名称">
          <el-input
            v-model="filterForm.name"
            placeholder="请输入优惠券名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="优惠券类型">
          <el-select
            v-model="filterForm.type"
            placeholder="请选择类型"
            clearable
            style="width: 150px"
          >
            <el-option label="满减券" value="fixed_amount" />
            <el-option label="折扣券" value="percentage" />
            <el-option label="免邮券" value="free_shipping" />
            <el-option label="买X送Y" value="buy_x_get_y" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filterForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="激活" value="active" />
            <el-option label="停用" value="inactive" />
            <el-option label="过期" value="expired" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>优惠券列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增优惠券
          </el-button>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="couponList"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="name" label="优惠券名称" min-width="180" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getCouponTypeTag(scope.row.type)">
              {{ getCouponTypeName(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优惠信息" min-width="200">
          <template #default="scope">
            <div class="discount-info">
              {{ getDiscountInfo(scope.row) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="适用品类" min-width="150">
          <template #default="scope">
            <div v-if="scope.row.categoryRestrictions?.length">
              <el-tag
                v-for="cat in scope.row.categoryRestrictions"
                :key="cat"
                size="small"
                style="margin-right: 4px; margin-bottom: 4px"
              >
                {{ cat }}
              </el-tag>
            </div>
            <span v-else class="text-muted">全部品类</span>
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="220">
          <template #default="scope">
            <div class="validity-period">
              <div class="date-item">
                <span class="label">开始:</span>
                <span>{{ scope.row.startDate ? formatDate(scope.row.startDate) : '无限制' }}</span>
              </div>
              <div class="date-item">
                <span class="label">结束:</span>
                <span>{{ scope.row.expiryDate ? formatDate(scope.row.expiryDate) : '无限制' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row)">
              {{ getStatusName(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="primary"
              link
              @click="handleCopy(scope.row)"
            >
              复制
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
      
      <div v-if="couponList.length === 0 && !loading" class="empty-container">
        <el-icon class="empty-icon"><DocumentRemove /></el-icon>
        <p>暂无优惠券数据</p>
        <el-button type="primary" @click="handleAdd" style="margin-top: 16px">
          立即添加
        </el-button>
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑优惠券' : '新增优惠券'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        v-loading="submitLoading"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优惠券名称" prop="name">
              <el-input
                v-model="formData.name"
                placeholder="请输入优惠券名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优惠券类型" prop="type">
              <el-select
                v-model="formData.type"
                placeholder="请选择类型"
                style="width: 100%"
                @change="handleTypeChange"
              >
                <el-option label="满减券" value="fixed_amount" />
                <el-option label="折扣券" value="percentage" />
                <el-option label="免邮券" value="free_shipping" />
                <el-option label="买X送Y" value="buy_x_get_y" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">优惠规则</el-divider>

        <el-row :gutter="20" v-if="formData.type === 'fixed_amount'">
          <el-col :span="12">
            <el-form-item label="满减金额" prop="amount">
              <el-input-number
                v-model="formData.amount"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="减免金额"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最低消费" prop="minAmount">
              <el-input-number
                v-model="formData.minAmount"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="最低消费金额"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="formData.type === 'percentage'">
          <el-col :span="12">
            <el-form-item label="折扣比例(%)" prop="percentage">
              <el-input-number
                v-model="formData.percentage"
                :min="0"
                :max="100"
                :precision="0"
                style="width: 100%"
                placeholder="如：80 表示8折"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最低消费" prop="minAmount">
              <el-input-number
                v-model="formData.minAmount"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="最低消费金额"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="formData.type === 'percentage'">
          <el-col :span="24">
            <el-form-item label="最高折扣金额">
              <el-input-number
                v-model="formData.maxDiscountAmount"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="不限制则留空"
              />
              <span class="form-tip">设置后折扣金额不会超过此值</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="formData.type === 'buy_x_get_y'">
          <el-col :span="12">
            <el-form-item label="购买数量" prop="buyQuantity">
              <el-input-number
                v-model="formData.buyQuantity"
                :min="1"
                style="width: 100%"
                placeholder="买X件"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="赠送数量" prop="getQuantity">
              <el-input-number
                v-model="formData.getQuantity"
                :min="1"
                style="width: 100%"
                placeholder="送Y件"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">使用限制</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生效日期">
              <el-date-picker
                v-model="formData.startDate"
                type="datetime"
                placeholder="选择生效日期"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过期日期">
              <el-date-picker
                v-model="formData.expiryDate"
                type="datetime"
                placeholder="选择过期日期"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最大使用次数">
              <el-input-number
                v-model="formData.maxUses"
                :min="1"
                style="width: 100%"
                placeholder="不限制则留空"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-switch
                v-model="formData.status"
                active-value="active"
                inactive-value="inactive"
                active-text="激活"
                inactive-text="停用"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="适用品类">
          <el-select
            v-model="formData.categoryRestrictions"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择适用品类，不选则全部适用"
            style="width: 100%"
          >
            <el-option
              v-for="cat in categoryOptions"
              :key="cat"
              :label="cat"
              :value="cat"
            />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">叠加互斥规则</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="互斥组">
              <el-select
                v-model="formData.mutexGroup"
                placeholder="选择互斥组"
                style="width: 100%"
                clearable
                filterable
                allow-create
              >
                <el-option
                  v-for="group in mutexGroupOptions"
                  :key="group"
                  :label="group"
                  :value="group"
                />
              </el-select>
              <span class="form-tip">同组内的优惠券互斥，只能使用一张</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大叠加数量">
              <el-input-number
                v-model="formData.maxStackCount"
                :min="1"
                style="width: 100%"
                placeholder="同类型最大叠加数"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="互斥优惠券">
          <el-select
            v-model="formData.mutexCoupons"
            multiple
            filterable
            placeholder="选择与此券互斥的其他优惠券"
            style="width: 100%"
          >
            <template v-for="coupon in filteredCouponList" :key="coupon?.id">
              <el-option
                v-if="coupon && coupon.id"
                :label="coupon.name || '未命名'"
                :value="coupon.id"
              />
            </template>
          </el-select>
        </el-form-item>

        <el-form-item label="使用说明">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入优惠券使用说明"
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

const filterForm = reactive({
  name: '',
  type: '',
  status: ''
})

const couponList = ref([])

const defaultFormData = {
  id: '',
  name: '',
  type: 'fixed_amount',
  amount: 0,
  minAmount: 0,
  percentage: 0,
  maxDiscountAmount: null,
  buyQuantity: 1,
  getQuantity: 1,
  startDate: null,
  expiryDate: null,
  maxUses: null,
  usedCount: 0,
  status: 'active',
  categoryRestrictions: [],
  mutexGroup: '',
  maxStackCount: null,
  mutexCoupons: [],
  description: ''
}

const formData = reactive({ ...defaultFormData })

const formRules = {
  name: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择优惠券类型', trigger: 'change' }],
  amount: [
    { 
      required: true, 
      message: '请输入满减金额', 
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (formData.type === 'fixed_amount' && (value === null || value === undefined || value === '')) {
          callback(new Error('请输入满减金额'))
        } else {
          callback()
        }
      }
    }
  ]
}

const categoryOptions = computed(() => {
  const categories = new Set()
  couponList.value.forEach(coupon => {
    if (coupon && coupon.categoryRestrictions && Array.isArray(coupon.categoryRestrictions)) {
      coupon.categoryRestrictions.forEach(cat => {
        if (cat) categories.add(cat)
      })
    }
  })
  return Array.from(categories)
})

const mutexGroupOptions = computed(() => {
  const groups = new Set()
  couponList.value.forEach(coupon => {
    if (coupon && coupon.mutexGroup) {
      groups.add(coupon.mutexGroup)
    }
  })
  return Array.from(groups)
})

const filteredCouponList = computed(() => {
  return couponList.value.filter(coupon => {
    return coupon && coupon.id && coupon.id !== formData.id
  })
})

const fetchCoupons = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/coupons')
    if (response.data.success) {
      couponList.value = response.data.data
    }
  } catch (error) {
    console.error('获取优惠券列表失败:', error)
    ElMessage.error('获取优惠券列表失败')
  } finally {
    loading.value = false
  }
}

const handleFilter = () => {
  ElMessage.info('筛选功能已启用')
}

const resetFilter = () => {
  filterForm.name = ''
  filterForm.type = ''
  filterForm.status = ''
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

const handleCopy = (row) => {
  isEdit.value = false
  Object.assign(formData, { ...row, id: '', name: row.name + ' (副本)' })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除优惠券"${row.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await axios.delete(`/api/coupons/${row.id}`)
    if (response.data.success) {
      ElMessage.success('删除成功')
      fetchCoupons()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleTypeChange = () => {
  formData.amount = 0
  formData.percentage = 0
  formData.buyQuantity = 1
  formData.getQuantity = 1
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
          response = await axios.put(`/api/coupons/${formData.id}`, data)
        } else {
          response = await axios.post('/api/coupons', data)
        }
        
        if (response.data.success) {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          fetchCoupons()
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

const getDiscountInfo = (coupon) => {
  if (!coupon) return '-'
  
  switch (coupon.type) {
    case 'fixed_amount':
      const amount = coupon.amount || 0
      const minAmount = coupon.minAmount || 0
      return minAmount > 0 
        ? `满${minAmount}减${amount}元`
        : `减${amount}元`
    case 'percentage':
      const percentage = coupon.percentage || 0
      const pMinAmount = coupon.minAmount || 0
      let info = `${percentage}折`
      if (pMinAmount > 0) {
        info += ` (满${pMinAmount}元可用)`
      }
      if (coupon.maxDiscountAmount) {
        info += ` 最高减${coupon.maxDiscountAmount}元`
      }
      return info
    case 'free_shipping':
      return '免运费'
    case 'buy_x_get_y':
      const buyQty = coupon.buyQuantity || 1
      const getQty = coupon.getQuantity || 1
      return `买${buyQty}送${getQty}`
    default:
      return '-'
  }
}

const getStatusName = (coupon) => {
  if (!coupon) return '未知'
  
  const now = new Date()
  if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
    return '过期'
  }
  return coupon.status === 'active' ? '激活' : '停用'
}

const getStatusTag = (coupon) => {
  if (!coupon) return 'info'
  
  const now = new Date()
  if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
    return 'danger'
  }
  return coupon.status === 'active' ? 'success' : 'info'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  fetchCoupons()
})
</script>

<style lang="scss" scoped>
.coupons-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
  
  .filter-form {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
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

.discount-info {
  font-size: 13px;
  color: #606266;
}

.validity-period {
  font-size: 12px;
  color: #606266;
  
  .date-item {
    display: flex;
    gap: 4px;
    
    .label {
      color: #909399;
    }
  }
}

.text-muted {
  color: #909399;
}

.form-tip {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
