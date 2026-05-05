import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { registerMicroApps, start } from 'qiankun'

import App from './App.vue'
import router from './router'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')

registerMicroApps([
  {
    name: 'activity-mfe',
    entry: '//localhost:4001',
    container: '#micro-app-container',
    activeRule: '/activity',
    props: {
      routerBase: '/activity'
    }
  },
  {
    name: 'flash-sale-mfe',
    entry: '//localhost:4002',
    container: '#micro-app-container',
    activeRule: '/flash-sale',
    props: {
      routerBase: '/flash-sale'
    }
  },
  {
    name: 'group-buy-mfe',
    entry: '//localhost:4003',
    container: '#micro-app-container',
    activeRule: '/group-buy',
    props: {
      routerBase: '/group-buy'
    }
  },
  {
    name: 'coupon-mfe',
    entry: '//localhost:4004',
    container: '#micro-app-container',
    activeRule: '/coupon',
    props: {
      routerBase: '/coupon'
    }
  },
  {
    name: 'lottery-mfe',
    entry: '//localhost:4005',
    container: '#micro-app-container',
    activeRule: '/lottery',
    props: {
      routerBase: '/lottery'
    }
  },
  {
    name: 'points-mfe',
    entry: '//localhost:4006',
    container: '#micro-app-container',
    activeRule: '/points',
    props: {
      routerBase: '/points'
    }
  },
  {
    name: 'distribution-mfe',
    entry: '//localhost:4007',
    container: '#micro-app-container',
    activeRule: '/distribution',
    props: {
      routerBase: '/distribution'
    }
  }
])

start({
  prefetch: false,
  sandbox: {
    strictStyleIsolation: true
  }
})
