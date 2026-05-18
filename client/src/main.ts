import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import App from './App.vue';
import './style.css';
import { initWebSocket } from './websocket';

const app = createApp(App);
app.use(createPinia());
// @ts-ignore ElementPlus locale type issue
app.use(ElementPlus, { locale: zhCn });
app.mount('#app');

initWebSocket();
