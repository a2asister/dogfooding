import { createRouter, createWebHistory } from 'vue-router';
import ActivityList from '../views/ActivityList.vue';
import ActivityForm from '../views/ActivityForm.vue';
import ActivityDetail from '../views/ActivityDetail.vue';

const routes = [
  {
    path: '/',
    name: 'ActivityList',
    component: ActivityList,
    meta: { title: '活动列表' }
  },
  {
    path: '/create',
    name: 'ActivityCreate',
    component: ActivityForm,
    meta: { title: '创建活动' }
  },
  {
    path: '/edit/:id',
    name: 'ActivityEdit',
    component: ActivityForm,
    meta: { title: '编辑活动' }
  },
  {
    path: '/detail/:id',
    name: 'ActivityDetail',
    component: ActivityDetail,
    meta: { title: '活动详情' }
  }
];

const router = createRouter({
  history: createWebHistory('/activity/'),
  routes
});

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '活动配置'} - 促销系统`;
  next();
});

export default router;
