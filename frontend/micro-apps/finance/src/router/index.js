import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const routes = [
  {
    path: '/',
    name: 'FinanceOverview',
    component: () => import('@/views/FinanceOverview.vue')
  },
  {
    path: '/transactions',
    name: 'TransactionsList',
    component: () => import('@/views/TransactionsList.vue')
  },
  {
    path: '/withdrawals',
    name: 'WithdrawalsList',
    component: () => import('@/views/WithdrawalsList.vue')
  },
  {
    path: '/reconciliation',
    name: 'Reconciliation',
    component: () => import('@/views/Reconciliation.vue')
  }
]

const router = createRouter({
  history: qiankunWindow.__POWERED_BY_QIANKUN__
    ? createWebHistory('/finance')
    : createWebHashHistory(),
  routes
})

export default router
