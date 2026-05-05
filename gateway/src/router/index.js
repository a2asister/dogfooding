import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/Layout.vue'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: Home,
        meta: { title: '首页' }
      },
      {
        path: 'activity/:pathMatch(.*)*',
        name: 'Activity',
        component: { template: '<div></div>' },
        meta: { title: '活动配置' }
      },
      {
        path: 'flash-sale/:pathMatch(.*)*',
        name: 'FlashSale',
        component: { template: '<div></div>' },
        meta: { title: '秒杀专场' }
      },
      {
        path: 'group-buy/:pathMatch(.*)*',
        name: 'GroupBuy',
        component: { template: '<div></div>' },
        meta: { title: '拼团活动' }
      },
      {
        path: 'coupon/:pathMatch(.*)*',
        name: 'Coupon',
        component: { template: '<div></div>' },
        meta: { title: '优惠券' }
      },
      {
        path: 'lottery/:pathMatch(.*)*',
        name: 'Lottery',
        component: { template: '<div></div>' },
        meta: { title: '抽奖活动' }
      },
      {
        path: 'points/:pathMatch(.*)*',
        name: 'Points',
        component: { template: '<div></div>' },
        meta: { title: '积分中心' }
      },
      {
        path: 'distribution/:pathMatch(.*)*',
        name: 'Distribution',
        component: { template: '<div></div>' },
        meta: { title: '分销中心' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 促销系统` : '促销系统'
  next()
})

export default router
