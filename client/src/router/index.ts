import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Editor from '../views/Editor.vue'
import Gallery from '../views/Gallery.vue'
import Stats from '../views/Stats.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', component: Editor },
  { path: '/gallery', component: Gallery },
  { path: '/stats', component: Stats },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
