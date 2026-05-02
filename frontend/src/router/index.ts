import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Attendance from '../views/Attendance.vue'
import Tasks from '../views/Tasks.vue'
import Projects from '../views/Projects.vue'
import Collaboration from '../views/Collaboration.vue'
import Efficiency from '../views/Efficiency.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/attendance',
    name: 'Attendance',
    component: Attendance
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: Tasks
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects
  },
  {
    path: '/collaboration',
    name: 'Collaboration',
    component: Collaboration
  },
  {
    path: '/efficiency',
    name: 'Efficiency',
    component: Efficiency
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
