import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const routes = [
  {
    path: '/',
    name: 'BasicSettings',
    component: () => import('@/views/BasicSettings.vue')
  },
  {
    path: '/payment',
    name: 'PaymentSettings',
    component: () => import('@/views/PaymentSettings.vue')
  },
  {
    path: '/shipping',
    name: 'ShippingSettings',
    component: () => import('@/views/ShippingSettings.vue')
  },
  {
    path: '/staff',
    name: 'StaffSettings',
    component: () => import('@/views/StaffSettings.vue')
  },
  {
    path: '/security',
    name: 'SecuritySettings',
    component: () => import('@/views/SecuritySettings.vue')
  }
]

const router = createRouter({
  history: qiankunWindow.__POWERED_BY_QIANKUN__
    ? createWebHistory('/settings')
    : createWebHashHistory(),
  routes
})

export default router
