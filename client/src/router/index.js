import { createRouter, createWebHistory } from 'vue-router'
import ProductList from '@/views/ProductList.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import ProductManage from '@/views/ProductManage.vue'
import SkuManage from '@/views/SkuManage.vue'
import DiscountManage from '@/views/DiscountManage.vue'

const routes = [
  {
    path: '/',
    name: 'ProductList',
    component: ProductList
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    redirect: '/admin/products',
    children: [
      {
        path: 'products',
        name: 'ProductManage',
        component: ProductManage
      },
      {
        path: 'skus',
        name: 'SkuManage',
        component: SkuManage
      },
      {
        path: 'discounts',
        name: 'DiscountManage',
        component: DiscountManage
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router