import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/products'
  },
  {
    path: '/products',
    name: 'Products',
    component: {
      render: () => null
    }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: {
      render: () => null
    }
  },
  {
    path: '/refunds',
    name: 'Refunds',
    component: {
      render: () => null
    }
  },
  {
    path: '/aftersales',
    name: 'Aftersales',
    component: {
      render: () => null
    }
  },
  {
    path: '/marketing',
    name: 'Marketing',
    component: {
      render: () => null
    }
  },
  {
    path: '/members',
    name: 'Members',
    component: {
      render: () => null
    }
  },
  {
    path: '/finance',
    name: 'Finance',
    component: {
      render: () => null
    }
  },
  {
    path: '/logistics',
    name: 'Logistics',
    component: {
      render: () => null
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: {
      render: () => null
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
