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
    path: '/creator/center',
    name: 'CreatorCenter',
    component: () => import('@/views/CreatorCenter.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/creator/verification',
    name: 'CreatorVerification',
    component: () => import('@/views/CreatorVerification.vue'),
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
        name: 'AdminUserList',
        component: () => import('@/views/admin/Users.vue'),
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/Settings.vue'),
      },
      {
        path: 'review/tasks',
        name: 'AdminReviewTasks',
        component: () => import('@/views/admin/ReviewTasks.vue'),
      },
      {
        path: 'review/logs',
        name: 'AdminReviewLogs',
        component: () => import('@/views/admin/ReviewLogs.vue'),
      },
      {
        path: 'risk/behavior',
        name: 'AdminBehaviorRisks',
        component: () => import('@/views/admin/BehaviorRisks.vue'),
      },
      {
        path: 'risk/account',
        name: 'AdminAccountRisks',
        component: () => import('@/views/admin/AccountRisks.vue'),
      },
      {
        path: 'risk/login-logs',
        name: 'AdminLoginLogs',
        component: () => import('@/views/admin/LoginLogs.vue'),
      },
      {
        path: 'risk/register-logs',
        name: 'AdminRegisterLogs',
        component: () => import('@/views/admin/RegisterLogs.vue'),
      },
      {
        path: 'operation/banners',
        name: 'AdminBanners',
        component: () => import('@/views/admin/BannerManage.vue'),
      },
      {
        path: 'operation/hot-ranks',
        name: 'AdminHotRanks',
        component: () => import('@/views/admin/HotRanks.vue'),
      },
      {
        path: 'operation/flow-support',
        name: 'AdminFlowSupport',
        component: () => import('@/views/admin/FlowSupport.vue'),
      },
      {
        path: 'creator/verifications',
        name: 'AdminVerifications',
        component: () => import('@/views/admin/VerificationReview.vue'),
      },
      {
        path: 'creator/data',
        name: 'AdminCreatorData',
        component: () => import('@/views/admin/CreatorDataCenter.vue'),
      },
      {
        path: 'system/roles',
        name: 'AdminRoles',
        component: () => import('@/views/admin/RolePermissions.vue'),
      },
      {
        path: 'system/admins',
        name: 'AdminUsers',
        component: () => import('@/views/admin/AdminUsers.vue'),
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
