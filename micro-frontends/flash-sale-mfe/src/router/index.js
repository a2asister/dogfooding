import { createRouter, createWebHistory } from 'vue-router';
import FlashSaleHome from '../views/FlashSaleHome.vue';
import FlashSaleDetail from '../views/FlashSaleDetail.vue';

const routes = [
  {
    path: '/',
    name: 'FlashSaleHome',
    component: FlashSaleHome,
    meta: { title: '限时秒杀' }
  },
  {
    path: '/detail/:id',
    name: 'FlashSaleDetail',
    component: FlashSaleDetail,
    meta: { title: '秒杀详情' }
  }
];

const router = createRouter({
  history: createWebHistory('/flash-sale/'),
  routes
});

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '限时秒杀'} - 促销系统`;
  next();
});

export default router;
