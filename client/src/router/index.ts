import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '仪表盘' },
  },
  {
    path: '/circuit-breakers',
    name: 'CircuitBreakers',
    component: () => import('@/views/CircuitBreakers.vue'),
    meta: { title: '熔断器管理' },
  },
  {
    path: '/rate-limiters',
    name: 'RateLimiters',
    component: () => import('@/views/RateLimiters.vue'),
    meta: { title: '限流管理' },
  },
  {
    path: '/isolations',
    name: 'Isolations',
    component: () => import('@/views/Isolations.vue'),
    meta: { title: '链路隔离' },
  },
  {
    path: '/chaos',
    name: 'Chaos',
    component: () => import('@/views/Chaos.vue'),
    meta: { title: '故障演练' },
  },
  {
    path: '/test',
    name: 'Test',
    component: () => import('@/views/Test.vue'),
    meta: { title: '测试工具' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 服务降级熔断平台` : '服务降级熔断平台';
  next();
});

export default router;
