import { createRouter, createWebHistory } from 'vue-router'
import ConfigPage from '@/views/ConfigPage.vue'
import DemoPage from '@/views/DemoPage.vue'
import SyncPage from '@/views/SyncPage.vue'

const routes = [
  {
    path: '/',
    name: 'Config',
    component: ConfigPage,
    meta: { title: '弹幕配置' }
  },
  {
    path: '/demo',
    name: 'Demo',
    component: DemoPage,
    meta: { title: '弹幕演示' }
  },
  {
    path: '/sync',
    name: 'Sync',
    component: SyncPage,
    meta: { title: '云同步' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '弹幕自定义配置平台'
  next()
})

export default router
