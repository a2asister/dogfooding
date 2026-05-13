import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/pets',
      name: 'pets',
      component: () => import('../views/PetsView.vue'),
    },
    {
      path: '/pet/:id',
      name: 'pet-detail',
      component: () => import('../views/PetDetailView.vue'),
    },
    {
      path: '/album',
      name: 'album',
      component: () => import('../views/AlbumView.vue'),
    },
  ],
})

export default router
