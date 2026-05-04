import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/account/:pathMatch(.*)*',
    name: 'account',
    component: () => import('../views/MicroApp.vue')
  },
  {
    path: '/transaction/:pathMatch(.*)*',
    name: 'transaction',
    component: () => import('../views/MicroApp.vue')
  },
  {
    path: '/wealth/:pathMatch(.*)*',
    name: 'wealth',
    component: () => import('../views/MicroApp.vue')
  },
  {
    path: '/loan/:pathMatch(.*)*',
    name: 'loan',
    component: () => import('../views/MicroApp.vue')
  },
  {
    path: '/credit-card/:pathMatch(.*)*',
    name: 'credit-card',
    component: () => import('../views/MicroApp.vue')
  },
  {
    path: '/risk/:pathMatch(.*)*',
    name: 'risk',
    component: () => import('../views/MicroApp.vue')
  },
  {
    path: '/report/:pathMatch(.*)*',
    name: 'report',
    component: () => import('../views/MicroApp.vue')
  },
  {
    path: '/customer/:pathMatch(.*)*',
    name: 'customer',
    component: () => import('../views/MicroApp.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
