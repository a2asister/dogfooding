import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import Devices from './views/Devices.vue'
import Traffic from './views/Traffic.vue'
import AccessControl from './views/AccessControl.vue'
import Settings from './views/Settings.vue'
import GuestNetwork from './views/GuestNetwork.vue'
import Alerts from './views/Alerts.vue'
import FileShare from './views/FileShare.vue'
import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/devices', name: 'Devices', component: Devices },
  { path: '/traffic', name: 'Traffic', component: Traffic },
  { path: '/access-control', name: 'AccessControl', component: AccessControl },
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/guest-network', name: 'GuestNetwork', component: GuestNetwork },
  { path: '/alerts', name: 'Alerts', component: Alerts },
  { path: '/file-share', name: 'FileShare', component: FileShare }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
