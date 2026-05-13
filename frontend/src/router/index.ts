import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/editor/:id?',
    name: 'Editor',
    component: () => import('@/views/Editor.vue'),
  },
  {
    path: '/preview/:id',
    name: 'Preview',
    component: () => import('@/views/Preview.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
