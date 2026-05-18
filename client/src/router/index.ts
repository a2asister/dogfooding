import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/experiments',
    name: 'Experiments',
    component: () => import('@/views/Experiments.vue'),
  },
  {
    path: '/simulate/:type',
    name: 'Simulate',
    component: () => import('@/views/Simulate.vue'),
  },
  {
    path: '/saved',
    name: 'SavedSimulations',
    component: () => import('@/views/SavedSimulations.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
