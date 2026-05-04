import { createRouter, createWebHistory } from 'vue-router'
import CustomerDashboard from '../views/CustomerDashboard.vue'
import CustomerList from '../views/CustomerList.vue'
import CustomerDetail from '../views/CustomerDetail.vue'
import CustomerCreate from '../views/CustomerCreate.vue'

const routes = [
  { path: '/', name: 'CustomerDashboard', component: CustomerDashboard },
  { path: '/list', name: 'CustomerList', component: CustomerList },
  { path: '/detail/:id', name: 'CustomerDetail', component: CustomerDetail },
  { path: '/create', name: 'CustomerCreate', component: CustomerCreate }
]

const router = createRouter({
  history: createWebHistory('/customer/'),
  routes
})

export default router
