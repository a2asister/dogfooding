import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { useUserStore } from '../store/userStore'
import Home from '../views/Home.vue'
import ArticleManagement from '../views/ArticleManagement.vue'
import CategoryManagement from '../views/CategoryManagement.vue'
import ContentAudit from '../views/ContentAudit.vue'

const isQiankun = window.__POWERED_BY_QIANKUN__

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/article-management',
    name: 'ArticleManagement',
    component: ArticleManagement,
    meta: { title: '文章管理', permission: 'content:article:read' }
  },
  {
    path: '/category-management',
    name: 'CategoryManagement',
    component: CategoryManagement,
    meta: { title: '分类管理', permission: 'content:category:read' }
  },
  {
    path: '/content-audit',
    name: 'ContentAudit',
    component: ContentAudit,
    meta: { title: '内容审核', permission: 'content:audit:read' }
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
    
    document.title = `内容管理 - ${to.meta.title || '首页'}`
    next()
  })
  
  return router
}

export { createAppRouter, router, history }
export default createAppRouter
