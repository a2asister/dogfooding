import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘', requiresAuth: true }
      },
      {
        path: 'code-repos',
        name: 'CodeRepos',
        component: () => import('@/views/CodeRepos.vue'),
        meta: { title: '代码仓库', requiresAuth: true, permission: 'code_repos:view' }
      },
      {
        path: 'api-docs',
        name: 'ApiDocs',
        component: () => import('@/views/ApiDocs.vue'),
        meta: { title: '接口文档', requiresAuth: true, permission: 'api_docs:view' }
      },
      {
        path: 'design-resources',
        name: 'DesignResources',
        component: () => import('@/views/DesignResources.vue'),
        meta: { title: '设计资源', requiresAuth: true, permission: 'design_resources:view' }
      },
      {
        path: 'test-cases',
        name: 'TestCases',
        component: () => import('@/views/TestCases.vue'),
        meta: { title: '测试用例', requiresAuth: true, permission: 'test_cases:view' }
      },
      {
        path: 'deployments',
        name: 'Deployments',
        component: () => import('@/views/Deployments.vue'),
        meta: { title: '部署记录', requiresAuth: true, permission: 'deployments:view' }
      },
      {
        path: 'git-integrations',
        name: 'GitIntegrations',
        component: () => import('@/views/GitIntegrations.vue'),
        meta: { title: 'Git集成', requiresAuth: true, permission: 'git_integrations:view' }
      },
      {
        path: 'cicd-pipelines',
        name: 'CicdPipelines',
        component: () => import('@/views/CicdPipelines.vue'),
        meta: { title: 'CI/CD流水线', requiresAuth: true, permission: 'cicd_pipelines:view' }
      },
      {
        path: 'cloud-services',
        name: 'CloudServices',
        component: () => import('@/views/CloudServices.vue'),
        meta: { title: '云服务', requiresAuth: true, permission: 'cloud_services:view' }
      },
      {
        path: 'asset-ledger',
        name: 'AssetLedger',
        component: () => import('@/views/AssetLedger.vue'),
        meta: { title: '资产台账', requiresAuth: true, permission: 'asset_ledger:view' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { title: '用户管理', requiresAuth: true, permission: 'users:view' }
      },
      {
        path: 'permissions',
        name: 'Permissions',
        component: () => import('@/views/Permissions.vue'),
        meta: { title: '权限管理', requiresAuth: true, permission: 'permissions:view' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人信息', requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - RMS` : '分布式研发资产管理系统 - RMS'
  
  const userStore = useUserStore()
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  if (to.name === 'Login' && token) {
    next({ name: 'Dashboard' })
    return
  }
  
  if (to.meta.permission && token) {
    if (!userStore.isAuthenticated) {
      await userStore.fetchCurrentUser()
    }
    
    if (!userStore.hasPermission(to.meta.permission)) {
      next({ name: 'Dashboard' })
      return
    }
  }
  
  next()
})

export default router
