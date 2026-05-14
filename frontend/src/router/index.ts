import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/editor',
    name: 'Editor',
    component: () => import('@/views/Editor.vue')
  },
  {
    path: '/portfolio',
    name: 'Portfolio',
    component: () => import('@/views/Portfolio.vue')
  },
  {
    path: '/card/:id',
    name: 'CardView',
    component: () => import('@/views/CardView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
