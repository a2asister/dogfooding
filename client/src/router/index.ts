import { createRouter, createWebHistory } from 'vue-router';
import FileManager from '@/views/FileManager.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'file-manager',
      component: FileManager
    }
  ]
});

export default router;
