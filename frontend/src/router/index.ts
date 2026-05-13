import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'timeline',
    component: () => import('../views/TimelineView.vue'),
  },
  {
    path: '/trips',
    name: 'trips',
    component: () => import('../views/TripsView.vue'),
  },
  {
    path: '/trip/:id',
    name: 'trip-detail',
    component: () => import('../views/TripDetailView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;