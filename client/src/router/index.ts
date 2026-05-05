import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Layout from '@/layouts/Layout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'DataLine' },
      },
      {
        path: 'repository',
        name: 'Repository',
        component: () => import('@/views/repository/index.vue'),
        meta: { title: '仓库管理', icon: 'Folder' },
      },
      {
        path: 'issues',
        name: 'Issues',
        component: () => import('@/views/issues/index.vue'),
        meta: { title: 'Issue 管理', icon: 'Document' },
      },
      {
        path: 'pull-requests',
        name: 'PullRequests',
        component: () => import('@/views/pull-requests/index.vue'),
        meta: { title: 'PR 管理', icon: 'Share' },
      },
      {
        path: 'contributors',
        name: 'Contributors',
        component: () => import('@/views/contributors/index.vue'),
        meta: { title: '贡献者统计', icon: 'User' },
      },
      {
        path: 'cicd',
        name: 'CICD',
        component: () => import('@/views/cicd/index.vue'),
        meta: { title: 'CI/CD 流水线', icon: 'Connection' },
      },
      {
        path: 'compliance',
        name: 'Compliance',
        component: () => import('@/views/compliance/index.vue'),
        meta: { title: '合规检测', icon: 'Warning' },
      },
      {
        path: 'releases',
        name: 'Releases',
        component: () => import('@/views/releases/index.vue'),
        meta: { title: '版本发布', icon: 'Promotion' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title
    ? `${to.meta.title} - 开源项目运营平台`
    : '开源项目运营与数据分析平台';
  next();
});

export default router;
