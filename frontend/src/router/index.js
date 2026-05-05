import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Logs from '../views/Logs.vue'
import Traces from '../views/Traces.vue'
import Alerts from '../views/Alerts.vue'
import AlertRules from '../views/AlertRules.vue'
import Services from '../views/Services.vue'
import Replay from '../views/Replay.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: '监控看板' }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: Logs,
    meta: { title: '日志查询' }
  },
  {
    path: '/traces',
    name: 'Traces',
    component: Traces,
    meta: { title: '链路追踪' }
  },
  {
    path: '/replay',
    name: 'Replay',
    component: Replay,
    meta: { title: '日志回放' }
  },
  {
    path: '/alerts',
    name: 'Alerts',
    component: Alerts,
    meta: { title: '告警中心' }
  },
  {
    path: '/alert-rules',
    name: 'AlertRules',
    component: AlertRules,
    meta: { title: '告警规则' }
  },
  {
    path: '/services',
    name: 'Services',
    component: Services,
    meta: { title: '服务管理' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
