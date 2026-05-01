import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '数据汇总' }
  },
  {
    path: '/stores',
    name: 'Stores',
    component: () => import('@/views/Stores.vue'),
    meta: { title: '门店管理' }
  },
  {
    path: '/customer-flows',
    name: 'CustomerFlows',
    component: () => import('@/views/CustomerFlows.vue'),
    meta: { title: '客流统计' }
  },
  {
    path: '/inventories',
    name: 'Inventories',
    component: () => import('@/views/Inventories.vue'),
    meta: { title: '库存管理' }
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('@/views/Members.vue'),
    meta: { title: '会员管理' }
  },
  {
    path: '/promotions',
    name: 'Promotions',
    component: () => import('@/views/Promotions.vue'),
    meta: { title: '营销活动' }
  },
  {
    path: '/attendances',
    name: 'Attendances',
    component: () => import('@/views/Attendances.vue'),
    meta: { title: '员工考勤' }
  },
  {
    path: '/employees',
    name: 'Employees',
    component: () => import('@/views/Employees.vue'),
    meta: { title: '员工管理' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || '线下门店数字化运营中台'}`;
  next();
});

export default router;
