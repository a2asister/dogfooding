import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

// 检查是否有预加载的数据（用于 SSR）
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

// 支持 hot module replacement
if (module.hot) {
  module.hot.accept();
}
