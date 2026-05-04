import { createRouter, createWebHistory } from 'vue-router'
import LoanList from '../views/LoanList.vue'
import LoanDetail from '../views/LoanDetail.vue'
import LoanCreate from '../views/LoanCreate.vue'

const routes = [
  {
    path: '/',
    name: 'LoanList',
    component: LoanList
  },
  {
    path: '/create',
    name: 'LoanCreate',
    component: LoanCreate
  },
  {
    path: '/:id',
    name: 'LoanDetail',
    component: LoanDetail
  }
]

const router = createRouter({
  history: createWebHistory('/loan/'),
  routes
})

export default router
