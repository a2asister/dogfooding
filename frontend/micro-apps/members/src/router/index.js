import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const routes = [
  {
    path: '/',
    name: 'MembersList',
    component: () => import('@/views/MembersList.vue')
  },
  {
    path: '/detail/:id',
    name: 'MemberDetail',
    component: () => import('@/views/MemberDetail.vue')
  },
  {
    path: '/levels',
    name: 'MemberLevels',
    component: () => import('@/views/MemberLevels.vue')
  }
]

const router = createRouter({
  history: qiankunWindow.__POWERED_BY_QIANKUN__
    ? createWebHistory('/members')
    : createWebHashHistory(),
  routes
})

export default router
