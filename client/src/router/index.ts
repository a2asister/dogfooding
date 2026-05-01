import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layouts/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '工作台', icon: 'Odometer' }
      },
      {
        path: 'contracts',
        name: 'Contracts',
        component: () => import('@/views/contracts/ContractList.vue'),
        meta: { title: '合同管理', icon: 'Document' }
      },
      {
        path: 'contracts/create',
        name: 'ContractCreate',
        component: () => import('@/views/contracts/ContractForm.vue'),
        meta: { title: '新建合同', hidden: true }
      },
      {
        path: 'contracts/edit/:id',
        name: 'ContractEdit',
        component: () => import('@/views/contracts/ContractForm.vue'),
        meta: { title: '编辑合同', hidden: true }
      },
      {
        path: 'contracts/detail/:id',
        name: 'ContractDetail',
        component: () => import('@/views/contracts/ContractDetail.vue'),
        meta: { title: '合同详情', hidden: true }
      },
      {
        path: 'approvals',
        name: 'Approvals',
        component: () => import('@/views/approvals/ApprovalList.vue'),
        meta: { title: '审批管理', icon: 'Stamp' }
      },
      {
        path: 'signatures',
        name: 'Signatures',
        component: () => import('@/views/signatures/SignatureList.vue'),
        meta: { title: '线上签章', icon: 'EditPen' }
      },
      {
        path: 'performance',
        name: 'Performance',
        component: () => import('@/views/performance/PerformanceList.vue'),
        meta: { title: '履约跟进', icon: 'List' }
      },
      {
        path: 'warnings',
        name: 'Warnings',
        component: () => import('@/views/warnings/WarningList.vue'),
        meta: { title: '到期预警', icon: 'Warning' }
      },
      {
        path: 'archives',
        name: 'Archives',
        component: () => import('@/views/archives/ArchiveList.vue'),
        meta: { title: '归档检索', icon: 'FolderOpened' }
      },
      {
        path: 'ai-review',
        name: 'AiReview',
        component: () => import('@/views/ai-review/AiReview.vue'),
        meta: { title: 'AI法务初审', icon: 'Cpu' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((_to, _from, next) => {
  document.title = '合同全生命周期管理系统'
  next()
})

export default router
