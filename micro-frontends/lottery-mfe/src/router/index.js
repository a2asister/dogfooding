import { createRouter, createWebHistory } from 'vue-router';
import LotteryHome from '../views/LotteryHome.vue';
import LotteryRecords from '../views/LotteryRecords.vue';

const routes = [
  {
    path: '/',
    name: 'LotteryHome',
    component: LotteryHome,
    meta: { title: '抽奖中心' }
  },
  {
    path: '/records',
    name: 'LotteryRecords',
    component: LotteryRecords,
    meta: { title: '抽奖记录' }
  }
];

const router = createRouter({
  history: createWebHistory('/lottery/'),
  routes
});

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '抽奖活动'} - 促销系统`;
  next();
});

export default router;
