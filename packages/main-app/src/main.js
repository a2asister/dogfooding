import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { registerMicroApps, start } from 'qiankun'
import './styles/main.css'

const microApps = [
  {
    name: 'account',
    entry: '//localhost:3001',
    container: '#micro-app-container',
    activeRule: '/account',
    props: {
      routerBase: '/account',
      parentRouter: router
    }
  },
  {
    name: 'transaction',
    entry: '//localhost:3002',
    container: '#micro-app-container',
    activeRule: '/transaction',
    props: {
      routerBase: '/transaction',
      parentRouter: router
    }
  },
  {
    name: 'wealth',
    entry: '//localhost:3003',
    container: '#micro-app-container',
    activeRule: '/wealth',
    props: {
      routerBase: '/wealth',
      parentRouter: router
    }
  },
  {
    name: 'loan',
    entry: '//localhost:3004',
    container: '#micro-app-container',
    activeRule: '/loan',
    props: {
      routerBase: '/loan',
      parentRouter: router
    }
  },
  {
    name: 'credit-card',
    entry: '//localhost:3005',
    container: '#micro-app-container',
    activeRule: '/credit-card',
    props: {
      routerBase: '/credit-card',
      parentRouter: router
    }
  },
  {
    name: 'risk',
    entry: '//localhost:3006',
    container: '#micro-app-container',
    activeRule: '/risk',
    props: {
      routerBase: '/risk',
      parentRouter: router
    }
  },
  {
    name: 'report',
    entry: '//localhost:3007',
    container: '#micro-app-container',
    activeRule: '/report',
    props: {
      routerBase: '/report',
      parentRouter: router
    }
  },
  {
    name: 'customer',
    entry: '//localhost:3008',
    container: '#micro-app-container',
    activeRule: '/customer',
    props: {
      routerBase: '/customer',
      parentRouter: router
    }
  }
]

registerMicroApps(microApps, {
  beforeLoad: [
    (app) => {
      console.log('[主应用] 开始加载微应用:', app.name)
      return Promise.resolve()
    }
  ],
  beforeMount: [
    (app) => {
      console.log('[主应用] 开始挂载微应用:', app.name)
      return Promise.resolve()
    }
  ],
  afterUnmount: [
    (app) => {
      console.log('[主应用] 卸载微应用完成:', app.name)
      return Promise.resolve()
    }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')

start({
  prefetch: false,
  sandbox: {
    experimentalStyleIsolation: true
  }
})
