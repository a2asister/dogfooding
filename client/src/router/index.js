import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EventDetailView from '../views/EventDetailView.vue'
import SeatSelectionView from '../views/SeatSelectionView.vue'
import OrderConfirmView from '../views/OrderConfirmView.vue'
import OrderSuccessView from '../views/OrderSuccessView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: '票务选座系统'
    }
  },
  {
    path: '/event/:id',
    name: 'event-detail',
    component: EventDetailView,
    meta: {
      title: '演出详情'
    }
  },
  {
    path: '/seat-selection/:eventId/:sessionId',
    name: 'seat-selection',
    component: SeatSelectionView,
    meta: {
      title: '座位选择'
    }
  },
  {
    path: '/order-confirm',
    name: 'order-confirm',
    component: OrderConfirmView,
    meta: {
      title: '订单确认'
    }
  },
  {
    path: '/order-success',
    name: 'order-success',
    component: OrderSuccessView,
    meta: {
      title: '购票成功'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
