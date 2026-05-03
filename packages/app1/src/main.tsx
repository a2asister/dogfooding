import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './styles/global.css';

interface LifecycleProps {
  container?: HTMLElement;
  appName?: string;
  appDisplayName?: string;
  version?: string;
  [key: string]: unknown;
}

let root: ReactDOM.Root | null = null;

function render(props: LifecycleProps = {}) {
  const { container } = props;
  
  const rootElement = container
    ? container.querySelector('#root')
    : document.getElementById('root');

  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  root = ReactDOM.createRoot(rootElement);

  root.render(
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
        <App {...props} />
      </ConfigProvider>
    </React.StrictMode>
  );
}

if (!(window as { __POWERED_BY_QIANKUN__?: boolean }).__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap(): Promise<void> {
  console.log('[dashboard] bootstrap');
}

export async function mount(props: LifecycleProps): Promise<void> {
  console.log('[dashboard] mount', props);
  message.config({
    top: 24,
    duration: 2,
    maxCount: 3,
    getContainer: () => {
      const { container } = props;
      return container || document.body;
    },
  });
  render(props);
}

export async function unmount(props: LifecycleProps): Promise<void> {
  console.log('[dashboard] unmount', props);
  if (root) {
    root.unmount();
    root = null;
  }
}

export async function update(props: LifecycleProps): Promise<void> {
  console.log('[dashboard] update', props);
}
