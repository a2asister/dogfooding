import { AnimationStep } from '@/types';

export const devSteps: AnimationStep[] = [
  {
    id: 'dev-0',
    phase: 'dev',
    title: '1. 项目初始化',
    description: 'Vite 启动开发服务器，加载 vite.config.ts 配置文件，初始化内部插件系统。Vite 使用 esbuild 作为底层构建引擎，相比传统 Webpack 启动速度提升 10-100 倍。',
    duration: 3000,
    key: 'init_project'
  },
  {
    id: 'dev-1',
    phase: 'dev',
    title: '2. 依赖预构建扫描',
    description: 'Vite 分析 package.json 中的 dependencies，扫描项目中的 import 语句，识别所有第三方依赖包 (如 react, lodash 等)。这是预构建的准备阶段。',
    duration: 3000,
    key: 'scan_dependencies'
  },
  {
    id: 'dev-2',
    phase: 'dev',
    title: '3. 依赖预构建优化',
    description: 'Vite 使用 esbuild 将 CommonJS/UMD 模块转换为 ESM 格式，并将多个内部模块打包成单个文件（如 lodash 包含数百个模块）。结果缓存到 node_modules/.vite/deps 目录。',
    duration: 3500,
    key: 'optimize_deps'
  },
  {
    id: 'dev-3',
    phase: 'dev',
    title: '4. 开发服务器启动',
    description: 'Vite 在本地端口 (默认 5173) 启动 HTTP 服务器。与传统打包工具不同，Vite 不预先打包所有代码，而是采用「原生 ESM 按需加载」策略。',
    duration: 2500,
    key: 'start_dev_server'
  },
  {
    id: 'dev-4',
    phase: 'dev',
    title: '5. 请求到达 & 模块解析',
    description: '浏览器请求入口文件 main.tsx，Vite 接收请求并解析模块依赖图。使用 Node 模块解析算法定位 node_modules 中的依赖。',
    duration: 3000,
    key: 'module_resolution'
  },
  {
    id: 'dev-5',
    phase: 'dev',
    title: '6. 按需编译转换',
    description: 'Vite 对每个文件进行即时转换：TS/TSX → JS、CSS 处理、SVG 等资源加载。esbuild 进行的转换速度极快，单文件通常在毫秒级完成。',
    duration: 3000,
    key: 'esbuild_transform'
  },
  {
    id: 'dev-6',
    phase: 'dev',
    title: '7. HMR: 文件变动检测',
    description: 'Vite 使用 chokidar 监听文件系统变更。当你修改并保存 App.tsx 时，Vite 立即检测到文件变化，但不会重新打包整个应用。',
    duration: 2500,
    key: 'hmr_file_change'
  },
  {
    id: 'dev-7',
    phase: 'dev',
    title: '8. HMR: 模块边界确定',
    description: 'Vite 分析依赖图，精确计算哪些模块受到影响。通过 import.meta.hot API 确定热更新边界（accept boundaries），只更新受影响的模块链。',
    duration: 3000,
    key: 'hmr_update'
  },
  {
    id: 'dev-8',
    phase: 'dev',
    title: '9. HMR: 实时替换生效',
    description: 'Vite 通过 WebSocket 向浏览器推送更新，替换旧模块。React Refresh 保留组件状态，应用状态不丢失，无需完整页面刷新。这是 Vite 开发体验的核心优势。',
    duration: 3000,
    key: 'hmr_reload'
  },
];

export const buildSteps: AnimationStep[] = [
  {
    id: 'build-0',
    phase: 'build',
    title: '1. 构建命令执行',
    description: '执行 vite build 命令，Vite 切换到生产构建模式。此时不再使用开发服务器，而是启动完整的打包流程，基于 Rollup 进行生产构建。',
    duration: 3000,
    key: 'start_build'
  },
  {
    id: 'build-1',
    phase: 'build',
    title: '2. Rollup 图分析',
    description: 'Rollup 从入口文件 main.tsx 开始递归分析整个依赖图。构建模块间的导入关系，识别所有使用到的模块，为后续优化做准备。',
    duration: 3000,
    key: 'rollup_analyze'
  },
  {
    id: 'build-2',
    phase: 'build',
    title: '3. 代码语法转译',
    description: 'TypeScript 类型剥离、JSX 转换、ESNext 语法降级到目标环境支持的版本。与开发模式不同，生产构建使用 @babel/preset-env 进行更完整的语法转换。',
    duration: 3500,
    key: 'code_transform'
  },
  {
    id: 'build-3',
    phase: 'build',
    title: '4. Tree Shaking 死码消除',
    description: 'Rollup 基于 ESM 静态分析，识别并移除未使用的代码。如果你 import { debounce } from lodash-es 但只使用了 debounce，其他几百个函数都将被剔除。',
    duration: 3500,
    key: 'tree_shaking'
  },
  {
    id: 'build-4',
    phase: 'build',
    title: '5. Code Splitting 代码分割',
    description: 'Vite 根据动态 import() 语句和配置自动分割代码。路由级别的代码分割是常见优化策略，用户只加载当前页面所需的代码，减少首屏加载时间。',
    duration: 3500,
    key: 'code_splitting'
  },
  {
    id: 'build-5',
    phase: 'build',
    title: '6. Chunk 生成与合并',
    description: 'Rollup 将模块打包成最终的 chunk 文件。第三方依赖单独打包成 vendor chunk，业务代码打包成 index chunk。Vite 默认配置提供了合理的 chunk 分割策略。',
    duration: 3000,
    key: 'chunk_generation'
  },
  {
    id: 'build-6',
    phase: 'build',
    title: '7. 静态资源优化处理',
    description: 'CSS 压缩合并、图片资源处理（小于阈值的内联为 base64）、字体文件处理、生成 content hash 文件名用于持久化缓存。CSS 还会自动添加浏览器前缀。',
    duration: 3000,
    key: 'asset_optimization'
  },
  {
    id: 'build-7',
    phase: 'build',
    title: '8. 输出 dist 目录',
    description: '所有优化完成后，Vite 将最终产物输出到 dist 目录。包含 index.html 入口文件、assets 目录下的 JS/CSS/图片等资源。这些文件可以直接部署到任何静态文件服务器。',
    duration: 3000,
    key: 'dist_output'
  },
];

export const allSteps = [...devSteps, ...buildSteps];

export const getStepByKey = (key: string): AnimationStep | undefined => {
  return allSteps.find(step => step.key === key);
};

export const getPhaseSteps = (phase: 'dev' | 'build'): AnimationStep[] => {
  return phase === 'dev' ? devSteps : buildSteps;
};
