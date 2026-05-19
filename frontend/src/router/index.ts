import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/client/HomeView.vue')
  },
  {
    path: '/intro',
    name: 'Intro',
    component: () => import('../views/client/IntroView.vue')
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('../views/client/NewsView.vue')
  },
  {
    path: '/news/:id',
    name: 'NewsDetail',
    component: () => import('../views/client/NewsDetailView.vue')
  },
  {
    path: '/events',
    name: 'Events',
    component: () => import('../views/client/EventsView.vue')
  },
  {
    path: '/download',
    name: 'Download',
    component: () => import('../views/client/DownloadView.vue')
  },
  {
    path: '/service',
    name: 'Service',
    component: () => import('../views/client/ServiceView.vue')
  },
  {
    path: '/compliance/:type',
    name: 'Compliance',
    component: () => import('../views/client/ComplianceView.vue')
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/LoginView.vue')
  },
  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import('../views/admin/LayoutView.vue'),
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/DashboardView.vue')
      },
      {
        path: 'news',
        name: 'AdminNews',
        component: () => import('../views/admin/NewsManageView.vue')
      },
      {
        path: 'events',
        name: 'AdminEvents',
        component: () => import('../views/admin/EventsManageView.vue')
      },
      {
        path: 'home',
        name: 'AdminHomeConfig',
        component: () => import('../views/admin/HomeConfigView.vue')
      },
      {
        path: 'tickets',
        name: 'AdminTickets',
        component: () => import('../views/admin/TicketsManageView.vue')
      },
      {
        path: 'reservations',
        name: 'AdminReservations',
        component: () => import('../views/admin/ReservationsView.vue')
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/admin/SettingsView.vue')
      },
      {
        path: 'compliance',
        name: 'AdminCompliance',
        component: () => import('../views/admin/ComplianceManageView.vue')
      },
      {
        path: 'statistics',
        name: 'AdminStatistics',
        component: () => import('../views/admin/StatisticsView.vue')
      },
      {
        path: 'logs',
        name: 'AdminLogs',
        component: () => import('../views/admin/LogsView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
