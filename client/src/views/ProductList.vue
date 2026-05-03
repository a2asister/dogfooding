<template>
  <div class="product-list">
    <div class="page-header">
      <h2>商品列表</h2>
      <p>浏览所有可用商品</p>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="products.length === 0" class="empty-state">
      <div class="empty-state-icon">📦</div>
      <h3>暂无商品</h3>
      <p>请在管理后台添加商品</p>
      <router-link to="/admin/products" class="btn btn-primary">
        去管理后台
      </router-link>
    </div>
    
    <div v-else class="products-grid">
      <div 
        v-for="product in products" 
        :key="product.id" 
        class="product-card card"
        @click="goToDetail(product.id)"
      >
        <div class="product-image">
          <img 
            :src="product.image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=商品%20默认图片%20灰色%20placeholder&image_size=square'" 
            :alt="product.name"
          />
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-description">{{ product.description || '暂无描述' }}</p>
          <div class="product-price">
            <span class="price">¥{{ product.price.toFixed(2) }}</span>
          </div>
          <div class="product-meta">
            <span class="badge badge-info">{{ product.category }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { productApi } from '@/api'

export default {
  name: 'ProductList',
  data() {
    return {
      products: [],
      loading: true
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
    goToDetail(productId) {
      this.$router.push(`/product/${productId}`)
    }
  }
}
</script>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.page-header h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #868e96;
  font-size: 1.1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-card {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 0.5rem;
}

.product-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.product-description {
  color: #868e96;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  margin-bottom: 0.75rem;
}

.product-meta {
  display: flex;
  align-items: center;
}
</style>