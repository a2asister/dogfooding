import type { FileItem, ProjectType, Language } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const getLanguageFromFileName = (fileName: string): Language => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'js':
    case 'javascript':
      return 'javascript';
    case 'ts':
    case 'typescript':
      return 'typescript';
    case 'jsx':
      return 'jsx';
    case 'tsx':
      return 'tsx';
    case 'json':
      return 'json';
    default:
      return 'javascript';
  }
};

const createFile = (name: string, content: string, parentId: string | null = null): FileItem => ({
  id: generateId(),
  name,
  type: 'file',
  content,
  language: getLanguageFromFileName(name),
  parentId,
});

const createFolder = (name: string, parentId: string | null = null): FileItem => ({
  id: generateId(),
  name,
  type: 'folder',
  content: '',
  language: 'json',
  parentId,
  isExpanded: true,
});

export const htmlTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebCode Demo</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>👋 欢迎使用 WebCode IDE</h1>
    <p>这是一个轻量级的在线代码编辑器</p>
    <button id="clickBtn">点击我</button>
    <p id="counter">点击次数: 0</p>
  </div>
  <script src="app.js"></script>
</body>
</html>`;

export const cssTemplate = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px 60px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 16px;
  font-size: 28px;
}

p {
  color: #666;
  margin-bottom: 24px;
  font-size: 16px;
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  font-size: 16px;
  border-radius: 30px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

button:active {
  transform: translateY(0);
}

#counter {
  margin-top: 16px;
  font-weight: 600;
  color: #667eea;
}`;

export const jsTemplate = `let count = 0;
const button = document.getElementById('clickBtn');
const counter = document.getElementById('counter');

button.addEventListener('click', () => {
  count++;
  counter.textContent = \`点击次数: \${count}\`;
  
  button.style.transform = 'scale(0.95)';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
  }, 100);
});

console.log('🚀 WebCode IDE 已加载!');`;

const getVanillaTemplates = (): FileItem[] => [
  createFile('index.html', htmlTemplate),
  createFile('style.css', cssTemplate),
  createFile('app.js', jsTemplate),
];

const getReactTemplates = (): FileItem[] => {
  const srcFolder = createFolder('src');
  const publicFolder = createFolder('public');
  
  return [
    createFile('package.json', JSON.stringify({
      name: 'react-app',
      version: '1.0.0',
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
    }, null, 2)),
    publicFolder,
    createFile('index.html', `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`, publicFolder.id),
    srcFolder,
    createFile('main.jsx', `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`, srcFolder.id),
    createFile('App.jsx', `import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <h1>👋 欢迎使用 React</h1>
      <button onClick={() => setCount(count + 1)}>
        点击次数: {count}
      </button>
    </div>
  );
}

export default App;`, srcFolder.id),
    createFile('App.css', `.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

h1 {
  color: white;
  margin-bottom: 24px;
}

button {
  padding: 12px 32px;
  font-size: 18px;
  border: none;
  border-radius: 8px;
  background: white;
  color: #667eea;
  cursor: pointer;
  transition: transform 0.2s;
}

button:hover {
  transform: scale(1.05);
}`, srcFolder.id),
    createFile('index.css', `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}`, srcFolder.id),
  ];
};

const getVueTemplates = (): FileItem[] => {
  const srcFolder = createFolder('src');
  
  return [
    createFile('package.json', JSON.stringify({
      name: 'vue-app',
      version: '1.0.0',
      dependencies: {
        vue: '^3.3.0',
      },
    }, null, 2)),
    createFile('index.html', `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`),
    srcFolder,
    createFile('main.js', `import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

createApp(App).mount('#app');`, srcFolder.id),
    createFile('App.vue', `<script setup>
import { ref } from 'vue';

const count = ref(0);
</script>

<template>
  <div class="app">
    <h1>👋 欢迎使用 Vue 3</h1>
    <button @click="count++">
      点击次数: {{ count }}
    </button>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
}

h1 {
  color: white;
  margin-bottom: 24px;
}

button {
  padding: 12px 32px;
  font-size: 18px;
  border: none;
  border-radius: 8px;
  background: white;
  color: #42b883;
  cursor: pointer;
  transition: transform 0.2s;
}

button:hover {
  transform: scale(1.05);
}
</style>`, srcFolder.id),
    createFile('style.css', `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}`, srcFolder.id),
  ];
};

const getViteTemplates = (): FileItem[] => {
  const srcFolder = createFolder('src');
  
  return [
    createFile('package.json', JSON.stringify({
      name: 'vite-project',
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      devDependencies: {
        vite: '^5.0.0',
      },
    }, null, 2)),
    createFile('vite.config.js', `import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
});`),
    createFile('index.html', `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vite Project</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`),
    srcFolder,
    createFile('main.js', `import './style.css';

const app = document.getElementById('app');
let count = 0;

app.innerHTML = \`
  <div class="container">
    <h1>⚡ Vite + Vanilla JS</h1>
    <button id="counter-btn">点击次数: 0</button>
  </div>
\`;

document.getElementById('counter-btn').addEventListener('click', () => {
  count++;
  document.getElementById('counter-btn').textContent = \`点击次数: \${count}\`;
});

console.log('🚀 Vite 项目已启动!');`, srcFolder.id),
    createFile('style.css', `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #646cff 0%, #747bff 100%);
}

.container {
  text-align: center;
}

h1 {
  color: white;
  margin-bottom: 24px;
}

button {
  padding: 12px 32px;
  font-size: 18px;
  border: none;
  border-radius: 8px;
  background: white;
  color: #646cff;
  cursor: pointer;
  transition: transform 0.2s;
}

button:hover {
  transform: scale(1.05);
}`, srcFolder.id),
  ];
};

export const getProjectTemplates = (type: ProjectType): FileItem[] => {
  switch (type) {
    case 'react':
      return getReactTemplates();
    case 'vue':
      return getVueTemplates();
    case 'vite':
      return getViteTemplates();
    case 'vanilla':
    default:
      return getVanillaTemplates();
  }
};
