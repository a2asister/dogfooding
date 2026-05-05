import { createRouter, createWebHistory } from 'vue-router';
import GroupBuyHome from '../views/GroupBuyHome.vue';
import GroupBuyDetail from '../views/GroupBuyDetail.vue';

const routes = [
  {
    path: '/',
    name: 'GroupBuyHome',
    component: GroupBuyHome,
    meta: { title: '拼团活动' }
  },
  {
    path: '/detail/:id',
    name: 'GroupBuyDetail',
    component: GroupBuyDetail,
    meta: { title: '拼团详情' }
  }
];

const router = createRouter({
  history: createWebHistory('/group-buy/'),
  routes
});

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '拼团活动'} - 促销系统`;
  next();
});

export default router;
