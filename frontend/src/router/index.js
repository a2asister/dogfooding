import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/coupons'
  },
  {
    path: '/coupons',
    name: 'Coupons',
    component: () => import('@/views/Coupons.vue'),
    meta: { title: '优惠券管理' }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/Products.vue'),
    meta: { title: '商品管理' }
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: () => import('@/views/Calculator.vue'),
    meta: { title: '价格计算器' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
