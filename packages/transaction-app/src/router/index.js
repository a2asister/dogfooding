import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/es/helper'

const routes = [
  { path: '/', redirect: '/transaction/list' },
  { path: '/transaction/list', name: 'TransactionList', component: () => import('../views/TransactionList.vue') },
  { path: '/transaction/detail/:id', name: 'TransactionDetail', component: () => import('../views/TransactionDetail.vue') },
  { path: '/transaction/create', name: 'TransactionCreate', component: () => import('../views/TransactionCreate.vue') }
]

const router = createRouter({
  history: qiankunWindow.__POWERED_BY_QIANKUN__ ? createWebHistory() : createWebHashHistory(),
  routes
})

export default router
