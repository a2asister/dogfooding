import { createRouter, createWebHistory } from 'vue-router'
import ProductList from '../views/ProductList.vue'
import ProductDetail from '../views/ProductDetail.vue'
import InvestmentList from '../views/InvestmentList.vue'

const routes = [
  {
    path: '/',
    name: 'ProductList',
    component: ProductList
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetail
  },
  {
    path: '/investments',
    name: 'InvestmentList',
    component: InvestmentList
  }
]

const router = createRouter({
  history: createWebHistory('/wealth/'),
  routes
})

export default router
