import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TopicsView from '../views/TopicsView.vue'
import TopicDetailView from '../views/TopicDetailView.vue'
import TasksView from '../views/TasksView.vue'
import TaskDetailView from '../views/TaskDetailView.vue'
import OrganizationsView from '../views/OrganizationsView.vue'
import WhitelistView from '../views/WhitelistView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/topics',
    name: 'Topics',
    component: TopicsView
  },
  {
    path: '/topics/:id',
    name: 'TopicDetail',
    component: TopicDetailView
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: TasksView
  },
  {
    path: '/tasks/:id',
    name: 'TaskDetail',
    component: TaskDetailView
  },
  {
    path: '/organizations',
    name: 'Organizations',
    component: OrganizationsView
  },
  {
    path: '/whitelist',
    name: 'Whitelist',
    component: WhitelistView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
