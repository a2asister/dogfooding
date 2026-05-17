import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import { useUserStore } from './stores/user';
import './styles/index.scss';

const app = createApp(App);
const pinia = createPinia();

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(pinia);

const initApp = async () => {
  const userStore = useUserStore();
  if (userStore.isLoggedIn && !userStore.user) {
    await userStore.fetchCurrentUser();
  }
  app.use(router);
  app.use(ElementPlus);
  app.mount('#app');
};

initApp();
