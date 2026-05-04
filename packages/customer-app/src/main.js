import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/es/helper'

let instance = null

function render(props = {}) {
  const { container, basePath } = props
  instance = createApp(App)
  if (basePath) router.options.history.base = basePath
  instance.use(router)
  instance.mount(container ? container.querySelector('#app') : '#app')
}

renderWithQiankun({
  mount(props) { render(props) },
  bootstrap() { console.log('customer-app bootstraped') },
  unmount(props) { instance.unmount(); instance._container.innerHTML = ''; instance = null },
  update(props) { console.log('update props', props) }
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) { render({}) }
