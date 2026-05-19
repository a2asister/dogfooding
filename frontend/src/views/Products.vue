<template>
  <Layout>
    <div class="product-page">
      <div class="page-header">
        <div>
          <h1>商品管理</h1>
          <p>管理您的带货商品，查看推广效果</p>
        </div>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          添加商品
        </el-button>
      </div>

      <div class="filter-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品名称"
          clearable
          style="width: 240px"
          @keyup.enter="fetchProducts"
        />
        <el-select v-model="filterCategory" placeholder="选择分类" clearable style="width: 160px">
          <el-option label="美妆个护" value="beauty" />
          <el-option label="服装穿搭" value="fashion" />
          <el-option label="美食探店" value="food" />
          <el-option label="家居生活" value="home" />
          <el-option label="数码科技" value="tech" />
          <el-option label="其他" value="other" />
        </el-select>
        <el-button type="primary" @click="fetchProducts">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>

      <div v-loading="loading" class="product-list">
        <el-table :data="products" border stripe>
          <el-table-column label="商品图" width="100">
            <template #default="{ row }">
              <el-image :src="row.images?.[0] || ''" fit="cover" style="width: 60px; height: 60px; border-radius: 4px" />
            </template>
          </el-table-column>
          <el-table-column prop="title" label="商品名称" min-width="200" show-overflow-tooltip />
          <el-table-column label="平台" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ row.brand || '-' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="价格" width="120">
            <template #default="{ row }">
              <div class="price-info">
                <span class="current-price">¥{{ row.price }}</span>
                <span v-if="row.originalPrice" class="original-price">¥{{ row.originalPrice }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="佣金" width="120">
            <template #default="{ row }">
              <div>
                <span class="commission-rate">{{ row.commissionRate }}%</span>
                <span class="commission-amount">¥{{ (row.price * row.commissionRate / 100).toFixed(2) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="salesCount" label="销量" width="100" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'approved' ? 'success' : 'info'" size="small">
                {{ row.status === 'approved' ? '上架中' : row.status === 'offline' ? '已下架' : row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="添加时间" width="160">
            <template #default="{ row }">
              {{ formatTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button :type="row.status === 'approved' ? 'warning' : 'success'" link size="small" @click="toggleStatus(row)">
                {{ row.status === 'approved' ? '下架' : '上架' }}
              </el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="!loading && products.length === 0" class="empty">
          <el-empty description="暂无商品，点击上方按钮添加" />
        </div>

        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="fetchProducts"
            @current-change="fetchProducts"
          />
        </div>
      </div>

      <el-dialog
        v-model="showCreateDialog"
        :title="editingProduct ? '编辑商品' : '添加商品'"
        width="600px"
        @close="resetForm"
      >
        <el-form ref="formRef" :model="productForm" :rules="formRules" label-width="100px">
          <el-form-item label="商品名称" prop="title">
            <el-input v-model="productForm.title" placeholder="请输入商品名称" />
          </el-form-item>
          <el-form-item label="商品描述" prop="description">
            <el-input v-model="productForm.description" type="textarea" :rows="3" placeholder="请输入商品描述" />
          </el-form-item>
          <el-form-item label="商品图片" prop="imageUrl">
            <el-input v-model="productForm.imageUrl" placeholder="请输入商品图片URL" />
          </el-form-item>
          <el-form-item label="商品链接" prop="productUrl">
            <el-input v-model="productForm.productUrl" placeholder="请输入商品原始链接" />
          </el-form-item>
          <el-form-item label="平台" prop="platform">
            <el-select v-model="productForm.platform" placeholder="请选择平台" style="width: 100%">
              <el-option label="淘宝" value="淘宝" />
              <el-option label="京东" value="京东" />
              <el-option label="拼多多" value="拼多多" />
              <el-option label="抖音" value="抖音" />
              <el-option label="小红书" value="小红书" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="分类" prop="category">
            <el-select v-model="productForm.category" placeholder="请选择分类" style="width: 100%">
              <el-option label="美妆个护" value="beauty" />
              <el-option label="服装穿搭" value="fashion" />
              <el-option label="美食探店" value="food" />
              <el-option label="家居生活" value="home" />
              <el-option label="数码科技" value="tech" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="售价" prop="price">
            <el-input-number v-model="productForm.price" :min="0" :precision="2" style="width: 100%" />
          </el-form-item>
          <el-form-item label="原价">
            <el-input-number v-model="productForm.originalPrice" :min="0" :precision="2" style="width: 100%" />
          </el-form-item>
          <el-form-item label="佣金率(%)" prop="commissionRate">
            <el-input-number v-model="productForm.commissionRate" :min="0" :max="100" :precision="1" style="width: 100%" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import { getProductList, createProduct, updateProduct, deleteProduct } from '@/api/product';
import type { Product } from '@/types';
import dayjs from 'dayjs';

const loading = ref(false);
const products = ref<Product[]>([]);
const searchKeyword = ref('');
const filterCategory = ref('');
const showCreateDialog = ref(false);
const editingProduct = ref<Product | null>(null);

const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
});

const productForm = ref({
  title: '',
  description: '',
  price: 0,
  originalPrice: undefined as number | undefined,
  commissionRate: 10,
  imageUrl: '',
  productUrl: '',
  platform: '',
  category: '',
  images: [] as string[],
  externalUrl: '',
});

const formRules = {
  title: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入商品描述', trigger: 'blur' }],
  imageUrl: [{ required: true, message: '请输入商品图片', trigger: 'blur' }],
  productUrl: [{ required: true, message: '请输入商品链接', trigger: 'blur' }],
  platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  commissionRate: [{ required: true, message: '请输入佣金率', trigger: 'blur' }],
};

const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm');

const fetchProducts = async () => {
  loading.value = true;
  try {
    const res = await getProductList({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      keyword: searchKeyword.value,
      category: filterCategory.value,
    });
    products.value = res?.list || [];
    pagination.value.total = res?.total || 0;
  } catch (error) {
    console.error('获取商品列表失败:', error);
    ElMessage.error('获取商品列表失败');
  } finally {
    loading.value = false;
  }
};

const handleEdit = (product: Product) => {
  editingProduct.value = product;
  productForm.value = {
    title: product.title,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    commissionRate: product.commissionRate,
    imageUrl: (product as any).imageUrl || (product.images && product.images[0]) || '',
    productUrl: (product as any).productUrl || product.externalUrl || '',
    platform: (product as any).platform || product.brand || '',
    category: product.category || '',
    images: product.images || [],
    externalUrl: product.externalUrl || '',
  };
  showCreateDialog.value = true;
};

const toggleStatus = async (product: Product) => {
  try {
    const newStatus = product.status === 'approved' ? 'offline' : 'approved';
    await updateProduct(product.id, { status: newStatus });
    ElMessage.success(product.status === 'approved' ? '已下架' : '已上架');
    fetchProducts();
  } catch (error) {
    console.error('更新状态失败:', error);
    ElMessage.error('操作失败');
  }
};

const handleDelete = async (product: Product) => {
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗？', '删除确认', {
      type: 'warning',
    });
    await deleteProduct(product.id);
    ElMessage.success('删除成功');
    fetchProducts();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleSubmit = async () => {
  try {
    const submitData = {
      title: productForm.value.title,
      description: productForm.value.description,
      price: productForm.value.price,
      originalPrice: productForm.value.originalPrice,
      commissionRate: productForm.value.commissionRate,
      images: productForm.value.imageUrl ? [productForm.value.imageUrl] : [],
      externalUrl: productForm.value.productUrl,
      category: productForm.value.category,
      brand: productForm.value.platform,
    };

    if (editingProduct.value) {
      await updateProduct(editingProduct.value.id, submitData);
      ElMessage.success('更新成功');
    } else {
      await createProduct(submitData);
      ElMessage.success('添加成功');
    }
    showCreateDialog.value = false;
    fetchProducts();
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error('提交失败');
  }
};

const resetForm = () => {
  editingProduct.value = null;
  productForm.value = {
    title: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    commissionRate: 10,
    imageUrl: '',
    productUrl: '',
    platform: '',
    category: '',
  };
};

onMounted(() => {
  fetchProducts();
});
</script>

<style lang="scss" scoped>
.product-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    color: #999;
    font-size: 14px;
    margin: 0;
  }
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
}

.product-list {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.price-info {
  display: flex;
  flex-direction: column;

  .current-price {
    color: #f56c6c;
    font-weight: 600;
    font-size: 14px;
  }

  .original-price {
    color: #999;
    text-decoration: line-through;
    font-size: 12px;
  }
}

.commission-rate {
  color: #67c23a;
  font-weight: 600;
  margin-right: 8px;
}

.commission-amount {
  color: #e6a23c;
  font-size: 12px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.empty {
  padding: 60px 0;
}
</style>
