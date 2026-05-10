import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'forms',
        name: 'FormList',
        component: () => import('@/views/FormList.vue')
      },
      {
        path: 'forms/new',
        name: 'FormCreate',
        component: () => import('@/views/FormDesigner.vue')
      },
      {
        path: 'forms/:id/edit',
        name: 'FormEdit',
        component: () => import('@/views/FormDesigner.vue')
      },
      {
        path: 'forms/:id/preview',
        name: 'FormPreview',
        component: () => import('@/views/FormPreview.vue')
      },
      {
        path: 'forms/:id/submissions',
        name: 'FormSubmissions',
        component: () => import('@/views/FormSubmissions.vue')
      },
      {
        path: 'submissions',
        name: 'SubmissionList',
        component: () => import('@/views/SubmissionList.vue')
      },
      {
        path: 'submissions/:id',
        name: 'SubmissionDetail',
        component: () => import('@/views/SubmissionDetail.vue')
      },
      {
        path: 'templates',
        name: 'TemplateList',
        component: () => import('@/views/TemplateList.vue')
      },
      {
        path: 'pending',
        name: 'PendingApprovals',
        component: () => import('@/views/PendingApprovals.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token && !authStore.isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && (token || authStore.isAuthenticated)) {
    next('/')
  } else {
    next()
  }
})

export default router
