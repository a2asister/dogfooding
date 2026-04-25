import { ModuleNode, Connection } from '@/types';

export const sourceModules: ModuleNode[] = [
  {
    id: 'main',
    name: 'main.tsx',
    type: 'entry',
    size: 256,
    imports: ['app'],
    position: { x: 50, y: 190 }
  },
  {
    id: 'app',
    name: 'App.tsx',
    type: 'app',
    size: 512,
    imports: ['header', 'content', 'footer', 'app-style'],
    position: { x: 200, y: 190 }
  },
  {
    id: 'header',
    name: 'Header.tsx',
    type: 'component',
    size: 384,
    imports: ['utils', 'logo'],
    position: { x: 380, y: 50 }
  },
  {
    id: 'content',
    name: 'Content.tsx',
    type: 'component',
    size: 768,
    imports: ['button', 'card', 'content-style'],
    position: { x: 380, y: 175 }
  },
  {
    id: 'footer',
    name: 'Footer.tsx',
    type: 'component',
    size: 256,
    imports: [],
    position: { x: 380, y: 300 }
  },
  {
    id: 'button',
    name: 'Button.tsx',
    type: 'component',
    size: 320,
    imports: ['button-style', 'utils'],
    position: { x: 550, y: 80 }
  },
  {
    id: 'card',
    name: 'Card.tsx',
    type: 'component',
    size: 448,
    imports: ['card-style', 'utils'],
    position: { x: 550, y: 150 }
  },
  {
    id: 'utils',
    name: 'utils.ts',
    type: 'utility',
    size: 192,
    imports: [],
    position: { x: 550, y: 290 }
  },
  {
    id: 'app-style',
    name: 'App.css',
    type: 'style',
    size: 512,
    imports: [],
    position: { x: 200, y: 310 }
  },
  {
    id: 'content-style',
    name: 'Content.module.css',
    type: 'style',
    size: 384,
    imports: [],
    position: { x: 550, y: 220 }
  },
  {
    id: 'button-style',
    name: 'Button.module.css',
    type: 'style',
    size: 256,
    imports: [],
    position: { x: 700, y: 80 }
  },
  {
    id: 'card-style',
    name: 'Card.module.css',
    type: 'style',
    size: 320,
    imports: [],
    position: { x: 700, y: 150 }
  },
  {
    id: 'logo',
    name: 'logo.svg',
    type: 'asset',
    size: 8,
    imports: [],
    position: { x: 550, y: 365 }
  },
];

export const nodeModules: ModuleNode[] = [
  {
    id: 'react',
    name: 'react',
    type: 'node_module',
    isNodeModule: true,
    size: 10240,
    imports: [],
    position: { x: 80, y: 80 }
  },
  {
    id: 'react-dom',
    name: 'react-dom',
    type: 'node_module',
    isNodeModule: true,
    size: 20480,
    imports: ['react'],
    position: { x: 80, y: 300 }
  },
  {
    id: 'lodash',
    name: 'lodash-es',
    type: 'node_module',
    isNodeModule: true,
    size: 25600,
    imports: [],
    position: { x: 80, y: 380 }
  },
];

export const optimizedModules: ModuleNode[] = [
  {
    id: 'react-optimized',
    name: 'react (optimized)',
    type: 'node_module',
    isNodeModule: true,
    isOptimized: true,
    size: 8192,
    imports: [],
    position: { x: 150, y: 80 }
  },
  {
    id: 'react-dom-optimized',
    name: 'react-dom (optimized)',
    type: 'node_module',
    isNodeModule: true,
    isOptimized: true,
    size: 16384,
    imports: ['react-optimized'],
    position: { x: 150, y: 300 }
  },
  {
    id: 'lodash-optimized',
    name: 'lodash-es (optimized)',
    type: 'node_module',
    isNodeModule: true,
    isOptimized: true,
    size: 20480,
    imports: [],
    position: { x: 150, y: 380 }
  },
];

export const buildChunks: ModuleNode[] = [
  {
    id: 'vendor-chunk',
    name: 'vendor-[hash].js',
    type: 'node_module',
    size: 35840,
    imports: [],
    position: { x: 650, y: 100 }
  },
  {
    id: 'index-chunk',
    name: 'index-[hash].js',
    type: 'entry',
    size: 3072,
    imports: ['vendor-chunk'],
    position: { x: 650, y: 200 }
  },
  {
    id: 'style-chunk',
    name: 'index-[hash].css',
    type: 'style',
    size: 1536,
    imports: [],
    position: { x: 650, y: 300 }
  },
  {
    id: 'asset-chunk',
    name: 'logo-[hash].svg',
    type: 'asset',
    size: 8,
    imports: [],
    position: { x: 650, y: 380 }
  },
];

export const moduleConnections: Connection[] = [
  { from: 'main', to: 'app', type: 'import' },
  { from: 'app', to: 'header', type: 'import' },
  { from: 'app', to: 'content', type: 'import' },
  { from: 'app', to: 'footer', type: 'import' },
  { from: 'app', to: 'app-style', type: 'import' },
  { from: 'header', to: 'utils', type: 'import' },
  { from: 'header', to: 'logo', type: 'import' },
  { from: 'content', to: 'button', type: 'import' },
  { from: 'content', to: 'card', type: 'import' },
  { from: 'content', to: 'content-style', type: 'import' },
  { from: 'button', to: 'button-style', type: 'import' },
  { from: 'button', to: 'utils', type: 'import' },
  { from: 'card', to: 'card-style', type: 'import' },
  { from: 'card', to: 'utils', type: 'import' },
];

export const nodeModuleConnections: Connection[] = [
  { from: 'react-dom', to: 'react', type: 'dependency' },
];

export const buildOutputConnections: Connection[] = [
  { from: 'index-chunk', to: 'vendor-chunk', type: 'dependency' },
];

export const getModuleById = (id: string, allModules?: ModuleNode[]): ModuleNode | undefined => {
  const modules = allModules || [...sourceModules, ...nodeModules, ...optimizedModules, ...buildChunks];
  return modules.find(m => m.id === id);
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
