import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

let app = null

function render(props = {}) {
  const { container } = props
  app = createApp(App)
  app.use(router)
  app.use(ElementPlus, { locale: zhCn })
  app.mount(container ? container.querySelector('#app') : '#app')
}

renderWithQiankun({
  mount(props) {
    console.log('refunds mount')
    render(props)
  },
  bootstrap() {
    console.log('refunds bootstrap')
  },
  unmount(props) {
    console.log('refunds unmount')
    app.unmount()
    app._container.innerHTML = ''
    app = null
  },
  update(props) {
    console.log('refunds update', props)
  }
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
