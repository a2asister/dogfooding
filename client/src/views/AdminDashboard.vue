<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <h2>管理后台</h2>
      <p>管理商品、SKU和优惠活动</p>
    </div>
    
    <div class="admin-tabs">
      <router-link 
        to="/admin/products" 
        class="admin-tab"
        :class="{ active: $route.name === 'ProductManage' }"
      >
        商品管理
      </router-link>
      <router-link 
        to="/admin/skus" 
        class="admin-tab"
        :class="{ active: $route.name === 'SkuManage' }"
      >
        SKU管理
      </router-link>
      <router-link 
        to="/admin/discounts" 
        class="admin-tab"
        :class="{ active: $route.name === 'DiscountManage' }"
      >
        优惠管理
      </router-link>
    </div>
    
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard'
}
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-header {
  margin-bottom: 2rem;
}

.admin-header h2 {
  font-size: 1.75rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.admin-header p {
  color: #868e96;
}
</style>