import { createRouter, createWebHistory } from 'vue-router';
import PointsHome from '../views/PointsHome.vue';
import PointsMall from '../views/PointsMall.vue';
import PointsTransactions from '../views/PointsTransactions.vue';

const routes = [
  {
    path: '/',
    name: 'PointsHome',
    component: PointsHome,
    meta: { title: '积分中心' }
  },
  {
    path: '/mall',
    name: 'PointsMall',
    component: PointsMall,
    meta: { title: '积分商城' }
  },
  {
    path: '/transactions',
    name: 'PointsTransactions',
    component: PointsTransactions,
    meta: { title: '积分明细' }
  }
];

const router = createRouter({
  history: createWebHistory('/points/'),
  routes
});

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '积分中心'} - 促销系统`;
  next();
});

export default router;
