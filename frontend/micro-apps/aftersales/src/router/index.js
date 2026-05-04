import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const routes = [
  {
    path: '/',
    name: 'AftersalesList',
    component: () => import('@/views/AftersalesList.vue')
  },
  {
    path: '/detail/:id',
    name: 'AftersalesDetail',
    component: () => import('@/views/AftersalesDetail.vue')
  }
]

const router = createRouter({
  history: qiankunWindow.__POWERED_BY_QIANKUN__
    ? createWebHistory('/aftersales')
    : createWebHashHistory(),
  routes
})

export default router
