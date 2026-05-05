import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Meters from '../views/Meters.vue'
import Devices from '../views/Devices.vue'
import AISuggestions from '../views/AISuggestions.vue'
import Reports from '../views/Reports.vue'
import Alerts from '../views/Alerts.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/meters',
    name: 'Meters',
    component: Meters
  },
  {
    path: '/devices',
    name: 'Devices',
    component: Devices
  },
  {
    path: '/ai-suggestions',
    name: 'AISuggestions',
    component: AISuggestions
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports
  },
  {
    path: '/alerts',
    name: 'Alerts',
    component: Alerts
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
