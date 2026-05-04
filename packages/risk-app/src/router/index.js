import { createRouter, createWebHistory } from 'vue-router'
import RiskDashboard from '../views/RiskDashboard.vue'
import AssessmentList from '../views/AssessmentList.vue'
import AlertList from '../views/AlertList.vue'
import Blacklist from '../views/Blacklist.vue'

const routes = [
  { path: '/', name: 'RiskDashboard', component: RiskDashboard },
  { path: '/assessments', name: 'AssessmentList', component: AssessmentList },
  { path: '/alerts', name: 'AlertList', component: AlertList },
  { path: '/blacklist', name: 'Blacklist', component: Blacklist }
]

const router = createRouter({
  history: createWebHistory('/risk/'),
  routes
})

export default router
