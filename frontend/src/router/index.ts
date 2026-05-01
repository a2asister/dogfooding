import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/babies',
    name: 'Babies',
    component: () => import('@/views/BabiesView.vue'),
    meta: { title: '宝宝档案' }
  },
  {
    path: '/babies/:id',
    name: 'BabyDetail',
    component: () => import('@/views/BabyDetailView.vue'),
    meta: { title: '宝宝详情' }
  },
  {
    path: '/sleep',
    name: 'Sleep',
    component: () => import('@/views/SleepView.vue'),
    meta: { title: '睡眠记录' }
  },
  {
    path: '/feeding',
    name: 'Feeding',
    component: () => import('@/views/FeedingView.vue'),
    meta: { title: '喂养记录' }
  },
  {
    path: '/vaccines',
    name: 'Vaccines',
    component: () => import('@/views/VaccinesView.vue'),
    meta: { title: '疫苗记录' }
  },
  {
    path: '/checkups',
    name: 'Checkups',
    component: () => import('@/views/CheckupsView.vue'),
    meta: { title: '体检记录' }
  },
  {
    path: '/growth',
    name: 'Growth',
    component: () => import('@/views/GrowthView.vue'),
    meta: { title: '成长数据' }
  },
  {
    path: '/reminders',
    name: 'Reminders',
    component: () => import('@/views/RemindersView.vue'),
    meta: { title: '育儿提醒' }
  },
  {
    path: '/diary',
    name: 'Diary',
    component: () => import('@/views/DiaryView.vue'),
    meta: { title: '成长日志' }
  },
  {
    path: '/albums',
    name: 'Albums',
    component: () => import('@/views/AlbumsView.vue'),
    meta: { title: '相册存档' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: '设置' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || '婴幼儿管理系统'}`
  next()
})

export default router
