import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'DataLine' }
      },
      {
        path: 'insurance-products',
        name: 'InsuranceProducts',
        component: () => import('../views/InsuranceProducts.vue'),
        meta: { title: '保险产品', icon: 'Ticket' }
      },
      {
        path: 'insured-persons',
        name: 'InsuredPersons',
        component: () => import('../views/InsuredPersons.vue'),
        meta: { title: '投保人管理', icon: 'User' }
      },
      {
        path: 'insurance-applications',
        name: 'InsuranceApplications',
        component: () => import('../views/InsuranceApplications.vue'),
        meta: { title: '投保管理', icon: 'Document' }
      },
      {
        path: 'underwriting',
        name: 'Underwriting',
        component: () => import('../views/Underwriting.vue'),
        meta: { title: '核保管理', icon: 'Stamp' }
      },
      {
        path: 'policies',
        name: 'Policies',
        component: () => import('../views/Policies.vue'),
        meta: { title: '保单管理', icon: 'Postcard' }
      },
      {
        path: 'claims',
        name: 'Claims',
        component: () => import('../views/Claims.vue'),
        meta: { title: '理赔管理', icon: 'Money' }
      },
      {
        path: 'anti-fraud',
        name: 'AntiFraud',
        component: () => import('../views/AntiFraud.vue'),
        meta: { title: '反欺诈', icon: 'Warning' }
      },
      {
        path: 'actuarial',
        name: 'Actuarial',
        component: () => import('../views/Actuarial.vue'),
        meta: { title: '精算分析', icon: 'TrendCharts' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 保险核保理赔系统` : '保险核保理赔系统'
  next()
})

export default router
