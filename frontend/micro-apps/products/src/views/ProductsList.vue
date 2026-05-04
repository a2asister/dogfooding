<template>
  <div class="products-list">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="searchForm.category" placeholder="请选择分类" clearable>
            <el-option label="全部" value="" />
            <el-option label="数码产品" value="digital" />
            <el-option label="服装服饰" value="clothing" />
            <el-option label="食品饮料" value="food" />
            <el-option label="家居用品" value="home" />
            <el-option label="美妆个护" value="beauty" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="上架中" value="active" />
            <el-option label="已下架" value="inactive" />
            <el-option label="已售罄" value="soldout" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>商品列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加商品
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="id" label="商品ID" width="100" />
        <el-table-column prop="name" label="商品名称" min-width="200">
          <template #default="scope">
            <div class="product-info">
              <el-image
                :src="scope.row.image"
                :preview-src-list="[scope.row.image]"
                fit="cover"
                style="width: 50px; height: 50px; margin-right: 10px;"
              />
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            <el-tag :type="getCategoryType(scope.row.category)">
              {{ getCategoryLabel(scope.row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120">
          <template #default="scope">
            <span class="price">¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="sales" label="销量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              type="primary"
              link
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '下架' : '上架' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const loading = ref(false)

const searchForm = reactive({
  name: '',
  category: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])

const mockProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB 黑色钛金属',
    category: 'digital',
    price: 9999,
    stock: 100,
    sales: 256,
    status: 'active',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20Max%20smartphone%20product%20photo%20on%20white%20background&image_size=square'
  },
  {
    id: 2,
    name: 'MacBook Pro 14英寸 M3 Pro 芯片',
    category: 'digital',
    price: 14999,
    stock: 50,
    sales: 128,
    status: 'active',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=MacBook%20Pro%20laptop%20product%20photo%20on%20white%20background&image_size=square'
  },
  {
    id: 3,
    name: '夏季新款男士休闲T恤纯棉圆领',
    category: 'clothing',
    price: 99,
    stock: 500,
    sales: 1024,
    status: 'active',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=men%20casual%20t-shirt%20product%20photo%20on%20white%20background&image_size=square'
  },
  {
    id: 4,
    name: '进口有机坚果礼盒装 混合坚果',
    category: 'food',
    price: 168,
    stock: 200,
    sales: 356,
    status: 'active',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20nuts%20gift%20box%20product%20photo%20on%20white%20background&image_size=square'
  },
  {
    id: 5,
    name: '北欧风格简约实木餐桌 长方形',
    category: 'home',
    price: 2999,
    stock: 30,
    sales: 45,
    status: 'inactive',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nordic%20style%20solid%20wood%20dining%20table%20product%20photo%20on%20white%20background&image_size=square'
  },
  {
    id: 6,
    name: '大牌同款保湿精华液 补水抗皱',
    category: 'beauty',
    price: 299,
    stock: 0,
    sales: 892,
    status: 'soldout',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20skincare%20serum%20bottle%20product%20photo%20on%20white%20background&image_size=square'
  },
  {
    id: 7,
    name: 'AirPods Pro 2 主动降噪耳机',
    category: 'digital',
    price: 1899,
    stock: 80,
    sales: 512,
    status: 'active',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wireless%20earbuds%20product%20photo%20on%20white%20background&image_size=square'
  },
  {
    id: 8,
    name: '女士夏季连衣裙 雪纺碎花中长款',
    category: 'clothing',
    price: 259,
    stock: 150,
    sales: 678,
    status: 'active',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=women%20summer%20floral%20dress%20product%20photo%20on%20white%20background&image_size=square'
  },
  {
    id: 9,
    name: '进口牛排套餐 原切菲力西冷',
    category: 'food',
    price: 399,
    stock: 100,
    sales: 234,
    status: 'active',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20steak%20package%20product%20photo%20on%20white%20background&image_size=square'
  },
  {
    id: 10,
    name: '智能落地台灯 护眼阅读灯',
    category: 'home',
    price: 199,
    stock: 200,
    sales: 456,
    status: 'active',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20desk%20lamp%20product%20photo%20on%20white%20background&image_size=square'
  }
]

const categoryMap = {
  digital: { label: '数码产品', type: 'primary' },
  clothing: { label: '服装服饰', type: 'success' },
  food: { label: '食品饮料', type: 'warning' },
  home: { label: '家居用品', type: 'info' },
  beauty: { label: '美妆个护', type: 'danger' }
}

const statusMap = {
  active: { label: '上架中', type: 'success' },
  inactive: { label: '已下架', type: 'info' },
  soldout: { label: '已售罄', type: 'warning' }
}

const getCategoryLabel = (category) => categoryMap[category]?.label || category
const getCategoryType = (category) => categoryMap[category]?.type || 'info'
const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

const fetchProducts = async () => {
  loading.value = true
  try {
    tableData.value = mockProducts
    pagination.total = mockProducts.length
  } catch (error) {
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  ElMessage.success('搜索成功')
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.category = ''
  searchForm.status = ''
  fetchProducts()
}

const handleAdd = () => {
  router.push('/products/add')
}

const handleEdit = (row) => {
  router.push(`/products/edit/${row.id}`)
}

const handleToggleStatus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status === 'active' ? '下架' : '上架'}该商品吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    row.status = row.status === 'active' ? 'inactive' : 'active'
    ElMessage.success('状态更新成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      pagination.total--
    }
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchProducts()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  fetchProducts()
}

onMounted(() => {
  fetchProducts()
})
</script>

<style lang="scss" scoped>
.products-list {
  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .product-info {
    display: flex;
    align-items: center;
  }

  .price {
    color: #f56c6c;
    font-weight: bold;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
