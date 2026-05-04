import { registerMicroApps, start, initGlobalState } from 'qiankun';
import getMicroApps, { getGlobalState } from './apps';
import useAuthStore from '../store/authStore';

let globalStateActions = null;

export const initQiankun = () => {
  const microApps = getMicroApps();
  
  registerMicroApps(microApps, {
    beforeLoad: (app) => {
      console.log('加载子应用:', app.name);
      const authStore = useAuthStore.getState();
      if (globalStateActions) {
        globalStateActions.setGlobalState({
          token: authStore.token,
          user: authStore.user,
          timestamp: Date.now(),
        });
      }
      return Promise.resolve();
    },
    beforeMount: (app) => {
      console.log('挂载子应用:', app.name);
      return Promise.resolve();
    },
    afterUnmount: (app) => {
      console.log('卸载子应用:', app.name);
      return Promise.resolve();
    },
  });

  globalStateActions = initGlobalState(getGlobalState());

  globalStateActions.onGlobalStateChange((state, prev) => {
    console.log('全局状态变化:', state, prev);
  });

  start({
    prefetch: true,
    sandbox: {
      strictStyleIsolation: true,
    },
  });
};

export const updateGlobalState = (newState) => {
  if (globalStateActions) {
    globalStateActions.setGlobalState({
      ...getGlobalState(),
      ...newState,
    });
  }
};

export const getCurrentGlobalState = () => {
  return getGlobalState();
};

export default initQiankun;
