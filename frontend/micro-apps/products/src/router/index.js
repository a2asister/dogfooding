import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const routes = [
  {
    path: '/',
    name: 'ProductsList',
    component: () => import('@/views/ProductsList.vue')
  },
  {
    path: '/add',
    name: 'ProductAdd',
    component: () => import('@/views/ProductForm.vue')
  },
  {
    path: '/edit/:id',
    name: 'ProductEdit',
    component: () => import('@/views/ProductForm.vue')
  }
]

const router = createRouter({
  history: qiankunWindow.__POWERED_BY_QIANKUN__
    ? createWebHistory('/products')
    : createWebHashHistory(),
  routes
})

export default router
