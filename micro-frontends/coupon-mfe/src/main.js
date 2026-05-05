import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import {
  qiankunWindow,
  renderWithQiankun,
} from 'vite-plugin-qiankun/dist/helper';

let app = null;

function render(props = {}) {
  const { container } = props;
  app = createApp(App);
  
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
  
  app
    .use(createPinia())
    .use(router)
    .use(ElementPlus, { locale: zhCn })
    .mount(container ? container.querySelector('#app') : '#app');
}

renderWithQiankun({
  mount(props) {
    console.log('coupon-mfe mount', props);
    render(props);
  },
  bootstrap() {
    console.log('coupon-mfe bootstrap');
  },
  unmount(props) {
    console.log('coupon-mfe unmount', props);
    if (app) {
      app.unmount();
      app = null;
    }
  },
  update(props) {
    console.log('coupon-mfe update', props);
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
