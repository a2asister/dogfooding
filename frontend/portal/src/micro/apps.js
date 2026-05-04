import useAuthStore from '../store/authStore';

const getMicroApps = () => {
  const authStore = useAuthStore.getState();
  const userSubsystems = authStore.user?.subsystems || [];
  
  const allApps = [
    {
      name: 'system-admin',
      entry: '//localhost:7101',
      container: '#subapp-container',
      activeRule: '/system-admin',
      props: {
        token: authStore.token,
        user: authStore.user,
      },
    },
    {
      name: 'data-analytics',
      entry: '//localhost:7102',
      container: '#subapp-container',
      activeRule: '/data-analytics',
      props: {
        token: authStore.token,
        user: authStore.user,
      },
    },
    {
      name: 'content-management',
      entry: '//localhost:7103',
      container: '#subapp-container',
      activeRule: '/content-management',
      props: {
        token: authStore.token,
        user: authStore.user,
      },
    },
  ];
  
  return allApps.filter(app => userSubsystems.includes(app.name));
};

export const getGlobalState = () => {
  const authStore = useAuthStore.getState();
  return {
    token: authStore.token,
    user: authStore.user,
    timestamp: Date.now(),
  };
};

export default getMicroApps;
