import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const routes = [
  {
    path: '/',
    name: 'MarketingList',
    component: () => import('@/views/MarketingList.vue')
  },
  {
    path: '/coupons',
    name: 'CouponsList',
    component: () => import('@/views/CouponsList.vue')
  },
  {
    path: '/promotions',
    name: 'PromotionsList',
    component: () => import('@/views/PromotionsList.vue')
  }
]

const router = createRouter({
  history: qiankunWindow.__POWERED_BY_QIANKUN__
    ? createWebHistory('/marketing')
    : createWebHashHistory(),
  routes
})

export default router
