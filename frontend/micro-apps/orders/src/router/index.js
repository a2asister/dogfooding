import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const routes = [
  {
    path: '/',
    name: 'OrdersList',
    component: () => import('@/views/OrdersList.vue')
  },
  {
    path: '/detail/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetail.vue')
  }
]

const router = createRouter({
  history: qiankunWindow.__POWERED_BY_QIANKUN__
    ? createWebHistory('/orders')
    : createWebHashHistory(),
  routes
})

export default router
