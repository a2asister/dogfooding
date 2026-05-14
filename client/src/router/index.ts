import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/assessment',
      name: 'assessment',
      component: () => import('../views/Assessment.vue')
    },
    {
      path: '/result',
      name: 'result',
      component: () => import('../views/Result.vue')
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/History.vue')
    }
  ]
})

export default router
