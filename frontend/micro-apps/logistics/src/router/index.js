import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const routes = [
  {
    path: '/',
    name: 'LogisticsList',
    component: () => import('@/views/LogisticsList.vue')
  },
  {
    path: '/detail/:id',
    name: 'LogisticsDetail',
    component: () => import('@/views/LogisticsDetail.vue')
  },
  {
    path: '/companies',
    name: 'LogisticsCompanies',
    component: () => import('@/views/LogisticsCompanies.vue')
  },
  {
    path: '/settings',
    name: 'LogisticsSettings',
    component: () => import('@/views/LogisticsSettings.vue')
  }
]

const router = createRouter({
  history: qiankunWindow.__POWERED_BY_QIANKUN__
    ? createWebHistory('/logistics')
    : createWebHashHistory(),
  routes
})

export default router
