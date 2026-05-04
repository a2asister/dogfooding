import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/es/helper'

const routes = [
  {
    path: '/',
    redirect: '/account/list'
  },
  {
    path: '/account/list',
    name: 'AccountList',
    component: () => import('../views/AccountList.vue')
  },
  {
    path: '/account/detail/:id',
    name: 'AccountDetail',
    component: () => import('../views/AccountDetail.vue')
  },
  {
    path: '/account/create',
    name: 'AccountCreate',
    component: () => import('../views/AccountCreate.vue')
  }
]

const router = createRouter({
  history: qiankunWindow.__POWERED_BY_QIANKUN__ 
    ? createWebHistory() 
    : createWebHashHistory(),
  routes
})

export default router
