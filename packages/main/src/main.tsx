import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './styles/global.css';
import { registerMicroApps, start } from 'qiankun';
import { microAppRegistry } from './services/microAppRegistry';

const getMicroApps = () => {
  const apps = microAppRegistry.apps;
  return apps
    .filter((app) => app.status === 'production' || app.status === 'staging')
    .map((app) => {
      const defaultVersion = app.versions.find((v) => v.isDefault) || app.versions[0];
      return {
        name: app.name,
        entry: defaultVersion?.entry || '',
        container: `#micro-app-container-${app.name}`,
        activeRule: `/app/${app.name}`,
        props: {
          ...app.sandboxConfig.props,
          appName: app.name,
          appDisplayName: app.displayName,
        },
      };
    });
};

registerMicroApps(getMicroApps(), {
  beforeLoad: [
    (app) => {
      console.log('[qiankun] before load', app.name);
      return Promise.resolve();
    },
  ],
  beforeMount: [
    (app) => {
      console.log('[qiankun] before mount', app.name);
      return Promise.resolve();
    },
  ],
  afterUnmount: [
    (app) => {
      console.log('[qiankun] after unmount', app.name);
      return Promise.resolve();
    },
  ],
});

start({
  sandbox: {
    strictStyleIsolation: false,
    experimentalStyleIsolation: true,
  },
  prefetch: true,
  singular: true,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
          fontSize: 14,
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
