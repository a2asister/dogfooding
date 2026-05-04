import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { useUserStore } from '../store/userStore'
import Home from '../views/Home.vue'
import DataDashboard from '../views/DataDashboard.vue'
import ReportCenter from '../views/ReportCenter.vue'

const isQiankun = window.__POWERED_BY_QIANKUN__

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/dashboard',
    name: 'DataDashboard',
    component: DataDashboard,
    meta: { title: '数据看板', permission: 'data:dashboard:read' }
  },
  {
    path: '/report-center',
    name: 'ReportCenter',
    component: ReportCenter,
    meta: { title: '报表中心', permission: 'data:report:read' }
  }
]

let router = null
let history = null

function createAppRouter(base = '/') {
  history = isQiankun 
    ? createWebHistory(base) 
    : createWebHashHistory()
  
  router = createRouter({
    history,
    routes
  })
  
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    
    if (to.meta.permission && !userStore.hasPermission(to.meta.permission)) {
      next('/')
      return
    }
    
    document.title = `数据分析 - ${to.meta.title || '首页'}`
    next()
  })
  
  return router
}

export { createAppRouter, router, history }
export default createAppRouter
