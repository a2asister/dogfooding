import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import Dashboard from '@/views/Dashboard.vue'
import Robots from '@/views/Robots.vue'
import Tasks from '@/views/Tasks.vue'
import PathPlanning from '@/views/PathPlanning.vue'
import Obstacles from '@/views/Obstacles.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: Dashboard,
          meta: { title: '仪表盘' },
        },
        {
          path: 'robots',
          name: 'Robots',
          component: Robots,
          meta: { title: '机器人管理' },
        },
        {
          path: 'tasks',
          name: 'Tasks',
          component: Tasks,
          meta: { title: '任务管理' },
        },
        {
          path: 'path-planning',
          name: 'PathPlanning',
          component: PathPlanning,
          meta: { title: '路径规划' },
        },
        {
          path: 'obstacles',
          name: 'Obstacles',
          component: Obstacles,
          meta: { title: '障碍物管理' },
        },
      ],
    },
  ],
})

export default router
