import { createRouter, createWebHistory } from 'vue-router';
import DistributionHome from '../views/DistributionHome.vue';
import CommissionRecords from '../views/CommissionRecords.vue';
import TeamManage from '../views/TeamManage.vue';
import WithdrawRecords from '../views/WithdrawRecords.vue';

const routes = [
  {
    path: '/',
    name: 'DistributionHome',
    component: DistributionHome,
    meta: { title: '分销中心' }
  },
  {
    path: '/commissions',
    name: 'CommissionRecords',
    component: CommissionRecords,
    meta: { title: '佣金明细' }
  },
  {
    path: '/team',
    name: 'TeamManage',
    component: TeamManage,
    meta: { title: '我的团队' }
  },
  {
    path: '/withdraws',
    name: 'WithdrawRecords',
    component: WithdrawRecords,
    meta: { title: '提现记录' }
  }
];

const router = createRouter({
  history: createWebHistory('/distribution/'),
  routes
});

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '分销中心'} - 促销系统`;
  next();
});

export default router;
