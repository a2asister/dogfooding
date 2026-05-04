import { createRouter, createWebHistory } from 'vue-router'
import ReportDashboard from '../views/ReportDashboard.vue'
import DailyReport from '../views/DailyReport.vue'
import MonthlyReport from '../views/MonthlyReport.vue'
import CustomReport from '../views/CustomReport.vue'

const routes = [
  { path: '/', name: 'ReportDashboard', component: ReportDashboard },
  { path: '/daily', name: 'DailyReport', component: DailyReport },
  { path: '/monthly', name: 'MonthlyReport', component: MonthlyReport },
  { path: '/custom', name: 'CustomReport', component: CustomReport }
]

const router = createRouter({
  history: createWebHistory('/report/'),
  routes
})

export default router
