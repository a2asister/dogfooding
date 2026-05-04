import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/es/helper'

let instance = null

function render(props = {}) {
  const { container } = props
  instance = createApp(App)
  instance.use(router)
  instance.mount(container ? container.querySelector('#transaction-app') : '#transaction-app')
}

renderWithQiankun({
  mount(props) { console.log('[交易微应用] mount'); render(props); window.dispatchEvent(new CustomEvent('qiankun:mount')) },
  bootstrap() { console.log('[交易微应用] bootstrap') },
  unmount() { console.log('[交易微应用] unmount'); if (instance) { instance.unmount(); instance = null }; window.dispatchEvent(new CustomEvent('qiankun:unmount')) },
  update(props) { console.log('[交易微应用] update', props) }
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) { render({}) }
