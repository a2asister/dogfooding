import { createRouter, createWebHistory } from 'vue-router'
import CardList from '../views/CardList.vue'
import CardDetail from '../views/CardDetail.vue'
import CardCreate from '../views/CardCreate.vue'

const routes = [
  { path: '/', name: 'CardList', component: CardList },
  { path: '/create', name: 'CardCreate', component: CardCreate },
  { path: '/:id', name: 'CardDetail', component: CardDetail }
]

const router = createRouter({
  history: createWebHistory('/credit-card/'),
  routes
})

export default router
