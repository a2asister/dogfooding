import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/es/helper'

let instance = null

function render(props = {}) {
  const { container, routerBase } = props
  
  instance = createApp(App)
  
  if (routerBase) {
    router.push(routerBase)
  }
  
  instance.use(router)
  instance.mount(container ? container.querySelector('#account-app') : '#account-app')
}

renderWithQiankun({
  mount(props) {
    console.log('[账户微应用] mount', props)
    render(props)
    window.dispatchEvent(new CustomEvent('qiankun:mount'))
  },
  bootstrap() {
    console.log('[账户微应用] bootstrap')
  },
  unmount() {
    console.log('[账户微应用] unmount')
    if (instance) {
      instance.unmount()
      instance._container.innerHTML = ''
      instance = null
    }
    window.dispatchEvent(new CustomEvent('qiankun:unmount'))
  },
  update(props) {
    console.log('[账户微应用] update', props)
  }
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({})
}
