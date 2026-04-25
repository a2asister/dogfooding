import { motion } from 'framer-motion';
import { useMemo } from 'react';
import ModuleGraph from './ModuleGraph';
import { 
  sourceModules, 
  buildChunks,
  moduleConnections,
  formatFileSize
} from '@/data/modules';
import { ActionType } from '@/types';

interface BuildFlowProps {
  currentStepKey: string;
  isPlaying: boolean;
}

interface StepConfig {
  title: string;
  subtitle: string;
  showSource: boolean;
  showBuildProcess: boolean;
  showOutput: boolean;
  activeSourceModules: string[];
  activeChunks: string[];
  highlightSource: boolean;
  highlightOutput: boolean;
  showTreeShaking: boolean;
  showCodeSplitting: boolean;
  removedModules: string[];
}

function BuildFlow({ currentStepKey, isPlaying }: BuildFlowProps) {
  const config = useMemo((): StepConfig => {
    const base: StepConfig = {
      title: 'Vite 生产构建',
      subtitle: 'Rollup 打包 + 全面优化',
      showSource: false,
      showBuildProcess: false,
      showOutput: false,
      activeSourceModules: [],
      activeChunks: [],
      highlightSource: false,
      highlightOutput: false,
      showTreeShaking: false,
      showCodeSplitting: false,
      removedModules: [],
    };

    const key = currentStepKey as ActionType;

    switch (key) {
      case 'start_build':
        return {
          ...base,
          title: '1. 构建命令执行',
          subtitle: 'vite build 启动生产构建流程',
          showBuildProcess: true,
        };
      
      case 'rollup_analyze':
        return {
          ...base,
          title: '2. Rollup 图分析',
          subtitle: '递归分析依赖图，构建模块关系',
          showSource: true,
          showBuildProcess: true,
          highlightSource: true,
          activeSourceModules: sourceModules.map(m => m.id),
        };
      
      case 'code_transform':
        return {
          ...base,
          title: '3. 代码语法转译',
          subtitle: 'TS 类型剥离、JSX 转换、语法降级',
          showSource: true,
          showBuildProcess: true,
          highlightSource: true,
          activeSourceModules: ['main', 'app', 'header', 'content', 'footer'],
        };
      
      case 'tree_shaking':
        return {
          ...base,
          title: '4. Tree Shaking 死码消除',
          subtitle: '静态分析 ESM，移除未使用代码',
          showSource: true,
          showBuildProcess: true,
          highlightSource: true,
          showTreeShaking: true,
          activeSourceModules: ['main', 'app', 'header', 'content'],
          removedModules: ['footer', 'utils'],
        };
      
      case 'code_splitting':
        return {
          ...base,
          title: '5. Code Splitting 代码分割',
          subtitle: '按动态 import 和路由自动分割',
          showSource: true,
          showBuildProcess: true,
          showCodeSplitting: true,
          highlightSource: true,
          activeSourceModules: ['header', 'content', 'button', 'card'],
        };
      
      case 'chunk_generation':
        return {
          ...base,
          title: '6. Chunk 生成与合并',
          subtitle: '第三方依赖 → vendor chunk，业务代码 → index chunk',
          showSource: true,
          showOutput: true,
          highlightOutput: true,
          activeChunks: ['vendor-chunk', 'index-chunk'],
        };
      
      case 'asset_optimization':
        return {
          ...base,
          title: '7. 静态资源优化处理',
          subtitle: 'CSS 压缩、图片处理、Content Hash',
          showOutput: true,
          highlightOutput: true,
          activeChunks: ['style-chunk', 'asset-chunk'],
        };
      
      case 'dist_output':
        return {
          ...base,
          title: '8. 输出 dist 目录',
          subtitle: '最终产物生成，可直接部署',
          showOutput: true,
          highlightOutput: true,
          activeChunks: buildChunks.map(m => m.id),
        };
      
      default:
        return base;
    }
  }, [currentStepKey]);

  const totalSourceSize = sourceModules.reduce((sum, m) => sum + (m.size || 0), 0);
  const totalOutputSize = buildChunks.reduce((sum, m) => sum + (m.size || 0), 0);

  return (
    <div className="h-full flex flex-col bg-surface-elevated rounded-2xl border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-surface-card/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary">{config.title}</h2>
            <p className="text-sm text-text-secondary">{config.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <BuildProgressIndicator 
              isActive={isPlaying} 
              stepKey={currentStepKey}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden p-4">
        <div className="absolute inset-4">
          <div className="h-full flex gap-4">
            {config.showSource && (
              <div className="flex-1 h-full flex flex-col">
                <div className="px-2 py-1 mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-module-app uppercase tracking-wider">
                    输入: 源代码
                  </span>
                  <span className="text-xs text-text-muted">
                    总计: {formatFileSize(totalSourceSize)}
                  </span>
                </div>
                <div className="flex-1 bg-surface/50 rounded-xl border border-border-soft overflow-hidden relative">
                  <ModuleGraph
                    modules={sourceModules}
                    connections={moduleConnections}
                    activeModuleIds={config.activeSourceModules}
                    highlightModuleIds={config.highlightSource ? sourceModules.map(m => m.id) : []}
                  />
                  
                  {config.showTreeShaking && (
                    <TreeShakingOverlay 
                      removedModules={config.removedModules}
                      isActive={isPlaying}
                    />
                  )}
                  
                  {config.showCodeSplitting && (
                    <CodeSplittingOverlay isActive={isPlaying} />
                  )}
                </div>
              </div>
            )}

            {config.showBuildProcess && (
              <div className="w-32 h-full flex flex-col items-center justify-center">
                <BuildProcessAnimation 
                  isActive={isPlaying}
                  stepKey={currentStepKey}
                />
              </div>
            )}

            {config.showOutput && (
              <div className="flex-1 h-full flex flex-col">
                <div className="px-2 py-1 mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                    输出: 构建产物
                  </span>
                  <span className="text-xs text-text-muted">
                    总计: {formatFileSize(totalOutputSize)}
                  </span>
                </div>
                <div className="flex-1 bg-surface/50 rounded-xl border border-border-soft overflow-hidden">
                  <OutputGraph 
                    chunks={buildChunks}
                    activeChunks={config.activeChunks}
                    highlightAll={config.highlightOutput}
                    isPlaying={isPlaying}
                  />
                </div>
              </div>
            )}

            {!config.showSource && !config.showOutput && (
              <div className="flex-1 flex items-center justify-center">
                <BuildInitialAnimation isActive={isPlaying} stepKey={currentStepKey} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildProgressIndicator({ isActive, stepKey }: { isActive: boolean; stepKey: string }) {
  const steps = [
    { key: 'start_build', label: '启动' },
    { key: 'rollup_analyze', label: '分析' },
    { key: 'code_transform', label: '转译' },
    { key: 'tree_shaking', label: 'TreeShake' },
    { key: 'code_splitting', label: '分割' },
    { key: 'chunk_generation', label: 'Chunk' },
    { key: 'asset_optimization', label: '资源' },
    { key: 'dist_output', label: '输出' },
  ];

  const currentIndex = steps.findIndex(s => s.key === stepKey);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center">
          <motion.div
            animate={
              i < currentIndex ? { backgroundColor: 'var(--color-secondary)' } :
              i === currentIndex ? { 
                backgroundColor: 'var(--color-primary)',
                scale: isActive ? [1, 1.2, 1] : 1
              } :
              { backgroundColor: 'var(--color-border)' }
            }
            transition={{ duration: 0.3 }}
            className={`w-2.5 h-2.5 rounded-full ${
              i < currentIndex ? 'bg-secondary' :
              i === currentIndex ? 'bg-primary' :
              'bg-border'
            }`}
          />
          {i < steps.length - 1 && (
            <div className={`w-4 h-0.5 ${
              i < currentIndex ? 'bg-secondary' : 'bg-border'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

function TreeShakingOverlay({ removedModules, isActive }: { removedModules: string[]; isActive: boolean }) {
  if (removedModules.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 pointer-events-none"
    >
      <div className="absolute top-4 right-4 bg-danger/20 border border-danger/50 rounded-lg px-3 py-2">
        <p className="text-xs text-danger font-medium flex items-center gap-1">
          <span className={isActive ? 'animate-pulse' : ''}>✗</span>
          移除死代码: {removedModules.length} 个模块
        </p>
      </div>
    </motion.div>
  );
}

function CodeSplittingOverlay({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 pointer-events-none"
    >
      <div className="absolute top-4 right-4 bg-secondary/20 border border-secondary/50 rounded-lg px-3 py-2">
        <p className="text-xs text-secondary font-medium flex items-center gap-1">
          <span className={isActive ? 'animate-pulse' : ''}>✂️</span>
          代码分割中...
        </p>
      </div>
    </motion.div>
  );
}

function BuildProcessAnimation({ isActive, stepKey }: { isActive: boolean; stepKey: string }) {
  const processLabels: Record<string, string> = {
    start_build: '🚀 启动',
    rollup_analyze: '🔍 分析',
    code_transform: '🔄 转译',
    tree_shaking: '🧹 清理',
    code_splitting: '✂️ 分割',
    chunk_generation: '📦 打包',
    asset_optimization: '🗜️ 压缩',
    dist_output: '📁 输出',
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        animate={isActive ? { y: [0, -10, 0] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="text-5xl mb-4"
      >
        ⚙️
      </motion.div>
      <motion.div
        animate={isActive ? { rotate: 360 } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full mb-4"
      />
      <motion.p
        key={stepKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-text-secondary text-center"
      >
        {processLabels[stepKey] || '处理中...'}
      </motion.p>
      <div className="flex gap-1 mt-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={isActive ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.5 }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-primary"
          />
        ))}
      </div>
    </div>
  );
}

function OutputGraph({ 
  chunks, 
  activeChunks, 
  highlightAll,
  isPlaying 
}: { 
  chunks: typeof buildChunks;
  activeChunks: string[];
  highlightAll: boolean;
  isPlaying: boolean;
}) {
  return (
    <div className="h-full p-4">
      <div className="grid grid-cols-2 gap-3 h-full">
        {chunks.map((chunk, index) => {
          const isActive = activeChunks.includes(chunk.id);
          const isHighlighted = highlightAll || isActive;

          return (
            <motion.div
              key={chunk.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isHighlighted ? 1 : 0.5,
                scale: isActive ? (isPlaying ? [1, 1.05, 1] : 1) : 1
              }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.1,
                scale: { duration: 0.5, repeat: isActive && isPlaying ? Infinity : 0 }
              }}
              className={`bg-surface-card rounded-xl border-2 p-3 flex flex-col ${
                isActive ? 'border-secondary shadow-lg shadow-secondary/20' :
                isHighlighted ? 'border-border-soft' :
                'border-border/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">
                  {chunk.type === 'node_module' ? '📦' :
                   chunk.type === 'entry' ? '🚪' :
                   chunk.type === 'style' ? '🎨' : '🖼️'}
                </span>
                <span className={`text-xs font-mono truncate ${
                  isActive ? 'text-secondary' : 'text-text-primary'
                }`}>
                  {chunk.name}
                </span>
              </div>
              <div className="mt-auto">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>大小</span>
                  <span className="font-medium text-text-primary">
                    {formatFileSize(chunk.size)}
                  </span>
                </div>
                <div className="mt-1 h-1.5 bg-surface rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isHighlighted ? '100%' : '30%' }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    className={`h-full ${
                      chunk.type === 'node_module' ? 'bg-module-node' :
                      chunk.type === 'entry' ? 'bg-module-entry' :
                      chunk.type === 'style' ? 'bg-module-style' : 'bg-module-asset'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function BuildInitialAnimation({ isActive, stepKey }: { isActive: boolean; stepKey: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative mb-8"
      >
        <div className="text-7xl">📦</div>
        <motion.div
          animate={isActive ? {
            y: [0, -5, 0],
            rotate: [0, 2, -2, 0]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-2 -right-2 text-3xl"
        >
          ⚡
        </motion.div>
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-text-primary mb-2"
      >
        {stepKey === 'start_build' ? '生产构建流程' : '准备就绪'}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-text-secondary text-center max-w-md"
      >
        {stepKey === 'start_build'
          ? '基于 Rollup 进行完整的生产构建，包含代码优化、压缩、分割等'
          : '点击下一步开始演示生产构建流程'}
      </motion.p>

      {stepKey === 'start_build' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 grid grid-cols-3 gap-4"
        >
          {[
            { icon: '🧹', label: 'Tree Shaking', desc: '死码消除' },
            { icon: '✂️', label: 'Code Splitting', desc: '代码分割' },
            { icon: '🗜️', label: 'Minification', desc: '代码压缩' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.15 }}
              className="px-4 py-3 bg-surface-card rounded-xl border border-border text-center"
            >
              <span className="text-2xl block mb-1">{item.icon}</span>
              <p className="text-sm font-medium text-text-primary">{item.label}</p>
              <p className="text-xs text-text-muted">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default BuildFlow;
