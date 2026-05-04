import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import createAppRouter from './router'
import { useUserStore } from './store/userStore'

let app = null
let router = null
let pinia = null

function render(props = {}) {
  const { container } = props
  const base = window.__POWERED_BY_QIANKUN__ ? '/system-admin' : '/'
  
  pinia = createPinia()
  router = createAppRouter(base)
  
  app = createApp(App)
  
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  
  app.use(pinia)
  app.use(router)
  app.use(ElementPlus, { locale: zhCn })
  
  const userStore = useUserStore()
  
  if (props.token) {
    userStore.setToken(props.token)
  }
  if (props.user) {
    userStore.setUser(props.user)
  }
  userStore.setQiankun(!!window.__POWERED_BY_QIANKUN__)
  
  app.mount(container ? container.querySelector('#app') : '#app')
}

if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

export async function bootstrap() {
  console.log('[system-admin] bootstrap')
}

export async function mount(props) {
  console.log('[system-admin] mount', props)
  
  if (props.onGlobalStateChange) {
    props.onGlobalStateChange((state, prev) => {
      console.log('[system-admin] global state changed:', state, prev)
      
      const userStore = useUserStore()
      if (state.token) {
        userStore.setToken(state.token)
      }
      if (state.user) {
        userStore.setUser(state.user)
      }
    }, true)
  }
  
  render(props)
}

export async function unmount() {
  console.log('[system-admin] unmount')
  
  const userStore = useUserStore()
  userStore.reset()
  
  app.unmount()
  app = null
  router = null
  pinia = null
}

export async function update(props) {
  console.log('[system-admin] update', props)
  
  if (props.token) {
    const userStore = useUserStore()
    userStore.setToken(props.token)
  }
  if (props.user) {
    const userStore = useUserStore()
    userStore.setUser(props.user)
  }
}
