import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      },
      {
        path: 'workflows',
        name: 'Workflows',
        component: () => import('@/views/Workflows.vue'),
        meta: { title: '流程编排', icon: 'Share' }
      },
      {
        path: 'workflows/:id',
        name: 'WorkflowEditor',
        component: () => import('@/views/WorkflowEditor.vue'),
        meta: { title: '流程编辑器', hidden: true }
      },
      {
        path: 'scripts',
        name: 'Scripts',
        component: () => import('@/views/Scripts.vue'),
        meta: { title: '自定义脚本', icon: 'Document' }
      },
      {
        path: 'schedules',
        name: 'Schedules',
        component: () => import('@/views/Schedules.vue'),
        meta: { title: '定时任务', icon: 'Timer' }
      },
      {
        path: 'apis',
        name: 'APIs',
        component: () => import('@/views/APIs.vue'),
        meta: { title: '接口自动化', icon: 'Connection' }
      },
      {
        path: 'robots',
        name: 'Robots',
        component: () => import('@/views/Robots.vue'),
        meta: { title: '机器人集群', icon: 'Cpu' }
      },
      {
        path: 'executions',
        name: 'Executions',
        component: () => import('@/views/Executions.vue'),
        meta: { title: '执行记录', icon: 'List' }
      },
      {
        path: 'recording',
        name: 'Recording',
        component: () => import('@/views/Recording.vue'),
        meta: { title: '可视化录制', icon: 'VideoCamera' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - RPA 低代码平台` : 'RPA 低代码自动化平台'
  next()
})

export default router
