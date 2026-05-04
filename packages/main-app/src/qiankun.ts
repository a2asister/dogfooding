import { registerMicroApps, start } from 'qiankun'

const microApps = [
  {
    name: 'user-app',
    entry: '//localhost:8081',
    container: '#micro-app-container',
    activeRule: '/user',
    props: {
      routerBase: '/user',
    },
  },
  {
    name: 'permission-app',
    entry: '//localhost:8082',
    container: '#micro-app-container',
    activeRule: '/permission',
    props: {
      routerBase: '/permission',
    },
  },
  {
    name: 'role-app',
    entry: '//localhost:8083',
    container: '#micro-app-container',
    activeRule: '/role',
    props: {
      routerBase: '/role',
    },
  },
  {
    name: 'department-app',
    entry: '//localhost:8084',
    container: '#micro-app-container',
    activeRule: '/department',
    props: {
      routerBase: '/department',
    },
  },
  {
    name: 'log-app',
    entry: '//localhost:8085',
    container: '#micro-app-container',
    activeRule: '/log',
    props: {
      routerBase: '/log',
    },
  },
  {
    name: 'audit-app',
    entry: '//localhost:8086',
    container: '#micro-app-container',
    activeRule: '/audit',
    props: {
      routerBase: '/audit',
    },
  },
  {
    name: 'ticket-app',
    entry: '//localhost:8087',
    container: '#micro-app-container',
    activeRule: '/ticket',
    props: {
      routerBase: '/ticket',
    },
  },
  {
    name: 'approval-app',
    entry: '//localhost:8088',
    container: '#micro-app-container',
    activeRule: '/approval',
    props: {
      routerBase: '/approval',
    },
  },
  {
    name: 'message-app',
    entry: '//localhost:8089',
    container: '#micro-app-container',
    activeRule: '/message',
    props: {
      routerBase: '/message',
    },
  },
  {
    name: 'setting-app',
    entry: '//localhost:8090',
    container: '#micro-app-container',
    activeRule: '/setting',
    props: {
      routerBase: '/setting',
    },
  },
]

registerMicroApps(microApps, {
  beforeLoad: (app) => {
    console.log('加载微应用', app.name)
    return Promise.resolve()
  },
  beforeMount: (app) => {
    console.log('挂载微应用', app.name)
    return Promise.resolve()
  },
  afterUnmount: (app) => {
    console.log('卸载微应用', app.name)
    return Promise.resolve()
  },
})

start({
  prefetch: true,
  sandbox: {
    strictStyleIsolation: true,
  },
})
