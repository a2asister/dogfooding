import { motion } from 'framer-motion';
import { useMemo } from 'react';
import ModuleGraph from './ModuleGraph';
import { 
  sourceModules, 
  nodeModules, 
  optimizedModules,
  moduleConnections
} from '@/data/modules';
import { ActionType, Connection } from '@/types';

interface DevFlowProps {
  currentStepKey: string;
  isPlaying: boolean;
}

interface StepConfig {
  title: string;
  subtitle: string;
  showNodeModules: boolean;
  showOptimized: boolean;
  showSource: boolean;
  showDevServer: boolean;
  showHMR: boolean;
  activeModuleIds: string[];
  flowingConnections: Connection[];
  highlightNodeModules: boolean;
  highlightOptimized: boolean;
  highlightSource: boolean;
}

function DevFlow({ currentStepKey, isPlaying }: DevFlowProps) {
  const config = useMemo((): StepConfig => {
    const base: StepConfig = {
      title: 'Vite 开发模式',
      subtitle: '原生 ESM 按需加载 + 依赖预构建',
      showNodeModules: false,
      showOptimized: false,
      showSource: false,
      showDevServer: false,
      showHMR: false,
      activeModuleIds: [],
      flowingConnections: [],
      highlightNodeModules: false,
      highlightOptimized: false,
      highlightSource: false,
    };

    const key = currentStepKey as ActionType;

    switch (key) {
      case 'init_project':
        return {
          ...base,
          title: '1. 项目初始化',
          subtitle: 'Vite 加载配置，初始化插件系统',
          showDevServer: true,
        };
      
      case 'scan_dependencies':
        return {
          ...base,
          title: '2. 扫描依赖',
          subtitle: '分析 package.json 和 import 语句',
          showNodeModules: true,
          highlightNodeModules: true,
        };
      
      case 'optimize_deps':
        return {
          ...base,
          title: '3. 依赖预构建',
          subtitle: 'esbuild 转换 CommonJS → ESM，打包优化',
          showNodeModules: true,
          showOptimized: true,
          highlightNodeModules: true,
          highlightOptimized: true,
          flowingConnections: [
            { from: 'react', to: 'react-optimized', type: 'dependency' as const },
            { from: 'react-dom', to: 'react-dom-optimized', type: 'dependency' as const },
            { from: 'lodash', to: 'lodash-optimized', type: 'dependency' as const },
          ],
        };
      
      case 'start_dev_server':
        return {
          ...base,
          title: '4. 开发服务器启动',
          subtitle: 'HTTP 服务器在端口 5173 就绪',
          showDevServer: true,
          showNodeModules: true,
          showOptimized: true,
        };
      
      case 'module_resolution':
        return {
          ...base,
          title: '5. 模块解析',
          subtitle: '浏览器请求入口文件，Vite 解析依赖图',
          showDevServer: true,
          showNodeModules: true,
          showOptimized: true,
          showSource: true,
          highlightSource: true,
          activeModuleIds: ['main', 'app'],
          flowingConnections: [
            { from: 'main', to: 'app', type: 'import' as const },
          ],
        };
      
      case 'esbuild_transform':
        return {
          ...base,
          title: '6. 按需编译转换',
          subtitle: 'TS/TSX → JS，CSS 处理，资源加载',
          showDevServer: true,
          showNodeModules: true,
          showOptimized: true,
          showSource: true,
          highlightSource: true,
          activeModuleIds: ['header', 'content', 'footer', 'button', 'card', 'utils'],
          flowingConnections: [...moduleConnections],
        };
      
      case 'hmr_file_change':
        return {
          ...base,
          title: '7. HMR: 文件变动检测',
          subtitle: 'chokidar 监听文件系统变更',
          showDevServer: true,
          showSource: true,
          showHMR: true,
          highlightSource: true,
          activeModuleIds: ['app'],
        };
      
      case 'hmr_update':
        return {
          ...base,
          title: '8. HMR: 模块边界确定',
          subtitle: '分析依赖图，确定热更新边界',
          showDevServer: true,
          showSource: true,
          showHMR: true,
          highlightSource: true,
          activeModuleIds: ['app', 'header', 'content', 'button', 'card'],
          flowingConnections: [
            { from: 'app', to: 'header', type: 'import' as const },
            { from: 'app', to: 'content', type: 'import' as const },
            { from: 'content', to: 'button', type: 'import' as const },
            { from: 'content', to: 'card', type: 'import' as const },
          ],
        };
      
      case 'hmr_reload':
        return {
          ...base,
          title: '9. HMR: 实时替换生效',
          subtitle: 'WebSocket 推送更新，React Refresh 保留状态',
          showDevServer: true,
          showSource: true,
          showHMR: true,
          highlightSource: true,
          activeModuleIds: ['app'],
        };
      
      default:
        return base;
    }
  }, [currentStepKey]);

  return (
    <div className="h-full flex flex-col bg-surface-elevated rounded-2xl border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-surface-card/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary">{config.title}</h2>
            <p className="text-sm text-text-secondary">{config.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            {config.showDevServer && (
              <DevServerIndicator isActive={isPlaying} />
            )}
            {config.showHMR && (
              <HMRIndicator isActive={isPlaying} />
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden p-4">
        <div className="absolute inset-4">
          <div className="h-full flex">
            {(config.showNodeModules || config.showOptimized) && (
              <div className="w-1/4 h-full flex flex-col">
                <div className="px-2 py-1 mb-2">
                  <span className="text-xs font-semibold text-module-node uppercase tracking-wider">
                    node_modules
                  </span>
                </div>
                <div className="flex-1 bg-surface/50 rounded-xl border border-border-soft overflow-hidden">
                  {config.showNodeModules && (
                    <div className="h-1/2 p-2 border-b border-border-soft">
                      <p className="text-xs text-text-muted mb-1">原始依赖</p>
                      <div className="space-y-1">
                        {nodeModules.map((m) => (
                          <motion.div
                            key={m.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`px-2 py-1.5 rounded text-xs font-medium ${
                              config.highlightNodeModules
                                ? 'bg-module-node/20 text-module-node'
                                : 'bg-surface-card text-text-secondary'
                            }`}
                          >
                            {m.name}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  {config.showOptimized && (
                    <div className="h-1/2 p-2">
                      <p className="text-xs text-text-muted mb-1">
                        <span className="text-secondary">✓</span> 预构建缓存
                      </p>
                      <div className="space-y-1">
                        {optimizedModules.map((m) => (
                          <motion.div
                            key={m.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className={`px-2 py-1.5 rounded text-xs font-medium ${
                              config.highlightOptimized
                                ? 'bg-secondary/20 text-secondary'
                                : 'bg-surface-card text-text-secondary'
                            }`}
                          >
                            <span className="mr-1">⚡</span>
                            {m.name.replace(' (optimized)', '')}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {config.showSource && (
              <div className="flex-1 h-full ml-4">
                <div className="px-2 py-1 mb-2">
                  <span className="text-xs font-semibold text-module-app uppercase tracking-wider">
                    源代码模块
                  </span>
                </div>
                <div className="h-[calc(100%-2rem)] bg-surface/50 rounded-xl border border-border-soft overflow-hidden">
                  <ModuleGraph
                    modules={sourceModules}
                    connections={moduleConnections}
                    activeModuleIds={config.activeModuleIds}
                    flowingConnections={config.flowingConnections}
                    highlightModuleIds={config.highlightSource ? sourceModules.map(m => m.id) : []}
                  />
                </div>
              </div>
            )}

            {!config.showSource && !config.showNodeModules && !config.showOptimized && (
              <div className="flex-1 flex items-center justify-center">
                <InitialAnimation isActive={isPlaying} stepKey={currentStepKey} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DevServerIndicator({ isActive }: { isActive: boolean }) {
  return (
    <motion.div 
      className="flex items-center gap-2 px-3 py-2 bg-secondary/10 rounded-lg"
      animate={isActive ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
    >
      <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-secondary animate-pulse' : 'bg-text-muted'}`} />
      <span className="text-sm font-medium text-secondary">开发服务器</span>
    </motion.div>
  );
}

function HMRIndicator({ isActive }: { isActive: boolean }) {
  return (
    <motion.div 
      className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-lg"
      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3, repeat: isActive ? Infinity : 0 }}
    >
      <span className="text-lg">🔄</span>
      <span className="text-sm font-medium text-accent">HMR 热更新</span>
    </motion.div>
  );
}

function InitialAnimation({ isActive, stepKey }: { isActive: boolean; stepKey: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative"
      >
        <motion.div
          animate={isActive ? {
            rotate: [0, 90, 180, 270, 360],
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-32 h-32 rounded-full border-4 border-dashed border-primary/30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl">⚡</span>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <h3 className="text-2xl font-bold text-text-primary mb-2">
          {stepKey === 'init_project' ? 'Vite 正在启动...' : '准备就绪'}
        </h3>
        <p className="text-text-secondary">
          {stepKey === 'init_project' 
            ? '加载 vite.config.ts，初始化插件系统' 
            : '选择下一步开始演示'}
        </p>
      </motion.div>

      {stepKey === 'init_project' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center gap-4"
        >
          {['配置文件', '插件系统', 'HTTP 服务器'].map((text, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.2 }}
              className="px-4 py-2 bg-surface-card rounded-lg border border-border"
            >
              <span className="text-sm text-text-secondary">{text}</span>
              <motion.span
                animate={isActive ? { opacity: [0.3, 1, 0.3] } : { opacity: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                className="ml-2 text-primary"
              >
                ●
              </motion.span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default DevFlow;
