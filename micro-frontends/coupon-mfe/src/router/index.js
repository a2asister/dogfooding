import { createRouter, createWebHistory } from 'vue-router';
import CouponHome from '../views/CouponHome.vue';
import MyCoupons from '../views/MyCoupons.vue';

const routes = [
  {
    path: '/',
    name: 'CouponHome',
    component: CouponHome,
    meta: { title: '优惠券中心' }
  },
  {
    path: '/my-coupons',
    name: 'MyCoupons',
    component: MyCoupons,
    meta: { title: '我的优惠券' }
  }
];

const router = createRouter({
  history: createWebHistory('/coupon/'),
  routes
});

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '优惠券'} - 促销系统`;
  next();
});

export default router;
