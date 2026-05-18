import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/user';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/note/:id',
    name: 'NoteDetail',
    component: () => import('@/views/NoteDetail.vue'),
  },
  {
    path: '/note/:id/edit',
    name: 'EditNote',
    component: () => import('@/views/EditNote.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/create',
    name: 'CreateNote',
    component: () => import('@/views/CreateNote.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/drafts',
    name: 'Drafts',
    component: () => import('@/views/Drafts.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/trash',
    name: 'Trash',
    component: () => import('@/views/Trash.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue'),
  },
  {
    path: '/topics',
    name: 'Topics',
    component: () => import('@/views/TopicSquare.vue'),
  },
  {
    path: '/topic/:id',
    name: 'TopicDetail',
    component: () => import('@/views/TopicDetail.vue'),
  },
  {
    path: '/collections',
    name: 'Collections',
    component: () => import('@/views/Collections.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/collections/:id',
    name: 'CollectionDetail',
    component: () => import('@/views/CollectionDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/Notifications.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('@/views/UserProfile.vue'),
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/publish',
    name: 'Publish',
    component: () => import('@/views/CreateNote.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/Index.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    redirect: '/admin/notes',
    children: [
      {
        path: 'notes',
        name: 'AdminNotes',
        component: () => import('@/views/admin/Notes.vue'),
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue'),
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/Settings.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login');
    return;
  }
  
  if (to.meta.requiresAdmin) {
    if (!userStore.user) {
      await userStore.fetchCurrentUser();
    }
    if (!userStore.isAdmin) {
      next('/');
      return;
    }
  }
  
  if (to.meta.guestOnly && userStore.isLoggedIn) {
    next('/');
    return;
  }
  
  next();
});

export default router;
