import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const routes = [
  {
    path: '/',
    name: 'RefundsList',
    component: () => import('@/views/RefundsList.vue')
  },
  {
    path: '/detail/:id',
    name: 'RefundDetail',
    component: () => import('@/views/RefundDetail.vue')
  }
]

const router = createRouter({
  history: qiankunWindow.__POWERED_BY_QIANKUN__
    ? createWebHistory('/refunds')
    : createWebHashHistory(),
  routes
})

export default router
