import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { useUserStore } from '../store/userStore'
import Home from '../views/Home.vue'
import UserManagement from '../views/UserManagement.vue'
import RoleManagement from '../views/RoleManagement.vue'

const isQiankun = window.__POWERED_BY_QIANKUN__

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/user-management',
    name: 'UserManagement',
    component: UserManagement,
    meta: { title: '用户管理', permission: 'system:user:read' }
  },
  {
    path: '/role-management',
    name: 'RoleManagement',
    component: RoleManagement,
    meta: { title: '角色管理', permission: 'system:role:read' }
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
    
    document.title = `系统管理 - ${to.meta.title || '首页'}`
    next()
  })
  
  return router
}

export { createAppRouter, router, history }
export default createAppRouter
