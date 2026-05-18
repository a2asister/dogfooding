import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Editor from '../views/Editor.vue'
import Results from '../views/Results.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/editor'
  },
  {
    path: '/editor',
    name: 'Editor',
    component: Editor
  },
  {
    path: '/results',
    name: 'Results',
    component: Results
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
