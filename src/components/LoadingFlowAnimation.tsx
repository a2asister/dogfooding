import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCode, 
  Loader2, 
  Shield, 
  Box, 
  Zap, 
  ArrowRight,
  PlayCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useAnimation } from '../contexts/AnimationContext';
import type { AnimationPhase } from '../types';
import { SUB_APPS } from '../types';
import { useEffect } from 'react';

const phaseConfig: Record<AnimationPhase, { 
  icon: React.ReactNode; 
  color: string; 
  title: string;
  description: string;
}> = {
  idle: { 
    icon: <PlayCircle className="w-8 h-8" />, 
    color: '#64748b',
    title: '准备就绪',
    description: '点击播放按钮开始演示微前端工作流程'
  },
  register: { 
    icon: <FileCode className="w-8 h-8" />, 
    color: '#6366f1',
    title: '子应用注册',
    description: '主应用读取子应用配置，建立路由映射表'
  },
  match_route: { 
    icon: <Zap className="w-8 h-8" />, 
    color: '#8b5cf6',
    title: '路由匹配',
    description: '主应用路由系统匹配到目标子应用'
  },
  load_resources: { 
    icon: <Loader2 className="w-8 h-8 animate-spin" />, 
    color: '#06b6d4',
    title: '资源加载',
    description: '动态加载子应用的 JS、CSS 资源文件'
  },
  create_sandbox: { 
    icon: <Shield className="w-8 h-8" />, 
    color: '#10b981',
    title: '沙箱创建',
    description: '创建独立的 JS 执行环境和样式隔离容器'
  },
  mount_app: { 
    icon: <Box className="w-8 h-8" />, 
    color: '#f59e0b',
    title: '应用挂载',
    description: '子应用渲染到指定 DOM 节点'
  },
  lifecycle_running: { 
    icon: <PlayCircle className="w-8 h-8" />, 
    color: '#22c55e',
    title: '运行中',
    description: '子应用独立运行，主应用监控状态'
  },
  route_switch: { 
    icon: <RefreshCw className="w-8 h-8" />, 
    color: '#a855f7',
    title: '路由切换',
    description: '切换到另一个子应用'
  },
  communication: { 
    icon: <ArrowRight className="w-8 h-8" />, 
    color: '#ec4899',
    title: '应用通信',
    description: '主应用与子应用间的数据传递'
  },
  unmount: { 
    icon: <Box className="w-8 h-8 rotate-180" />, 
    color: '#f97316',
    title: '应用卸载',
    description: '子应用从 DOM 中移除'
  },
  destroy: { 
    icon: <Trash2 className="w-8 h-8" />, 
    color: '#ef4444',
    title: '资源销毁',
    description: '彻底清理子应用资源'
  },
};

export function LoadingFlowAnimation() {
  const { state, setActiveApp } = useAnimation();
  const currentPhase = state.currentStep >= 0 
    ? ['register', 'match_route', 'load_resources', 'create_sandbox', 'mount_app', 
       'lifecycle_running', 'route_switch', 'communication', 'unmount', 'destroy'][state.currentStep] as AnimationPhase
    : 'idle';

  useEffect(() => {
    if (state.currentStep >= 0 && state.currentStep <= 6) {
      setActiveApp('app1');
    } else if (state.currentStep === 7) {
      setActiveApp('app2');
    } else if (state.currentStep >= 8) {
      setActiveApp(null);
    }
  }, [state.currentStep, setActiveApp]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
    >
      <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
        加载流程动画
      </h3>

      <div className="relative h-80 bg-slate-900/50 rounded-xl overflow-hidden mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {renderPhaseAnimation(currentPhase)}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl">
        <motion.div
          animate={{ 
            scale: state.isPlaying ? [1, 1.1, 1] : 1,
            rotate: currentPhase === 'load_resources' ? 360 : 0
          }}
          transition={{ 
            scale: { repeat: state.isPlaying ? Infinity : 0, duration: 1 },
            rotate: { repeat: currentPhase === 'load_resources' ? Infinity : 0, duration: 2, ease: 'linear' }
          }}
          className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ 
            backgroundColor: `${phaseConfig[currentPhase].color}20`,
            color: phaseConfig[currentPhase].color 
          }}
        >
          {phaseConfig[currentPhase].icon}
        </motion.div>
        <div>
          <h4 
            className="text-lg font-bold"
            style={{ color: phaseConfig[currentPhase].color }}
          >
            {phaseConfig[currentPhase].title}
          </h4>
          <p className="text-sm text-slate-400 mt-0.5">
            {phaseConfig[currentPhase].description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function renderPhaseAnimation(phase: AnimationPhase) {
  switch (phase) {
    case 'idle':
      return <IdleAnimation />;
    case 'register':
      return <RegisterAnimation />;
    case 'match_route':
      return <MatchRouteAnimation />;
    case 'load_resources':
      return <LoadResourcesAnimation />;
    case 'create_sandbox':
      return <CreateSandboxAnimation />;
    case 'mount_app':
      return <MountAppAnimation />;
    case 'lifecycle_running':
      return <LifecycleRunningAnimation />;
    case 'route_switch':
      return <RouteSwitchAnimation />;
    case 'communication':
      return <CommunicationAnimation />;
    case 'unmount':
      return <UnmountAnimation />;
    case 'destroy':
      return <DestroyAnimation />;
    default:
      return <IdleAnimation />;
  }
}

function IdleAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-center"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-slate-700/50 flex items-center justify-center">
          <Boxes className="w-10 h-10 text-slate-500" />
        </div>
        <p className="text-slate-500 text-sm">点击播放按钮开始演示</p>
      </motion.div>
    </div>
  );
}

function RegisterAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex items-end gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(99, 102, 241, 0.2)', '0 0 40px rgba(99, 102, 241, 0.4)', '0 0 20px rgba(99, 102, 241, 0.2)'] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-24 h-32 bg-indigo-500/20 rounded-2xl border-2 border-indigo-500/50 flex flex-col items-center justify-center"
          >
            <FileCode className="w-8 h-8 text-indigo-400 mb-2" />
            <span className="text-indigo-300 font-bold text-sm">主应用</span>
            <span className="text-xs text-indigo-400/60">基座</span>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ scaleX: [0, 1, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
        />

        <div className="flex flex-col gap-3">
          {SUB_APPS.map((app, idx) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.3 }}
              className="flex items-center gap-3 px-4 py-2 rounded-xl"
              style={{ 
                backgroundColor: `${app.color}15`,
                border: `1px solid ${app.color}40`
              }}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: app.color }}
              />
              <span 
                className="text-sm font-medium"
                style={{ color: app.color }}
              >
                {app.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 left-0 right-0 text-center"
      >
        <span className="text-xs text-slate-500">
          主应用读取子应用注册表，建立路由映射关系
        </span>
      </motion.div>
    </div>
  );
}

function MatchRouteAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-32 h-32 bg-indigo-500/20 rounded-full border-2 border-indigo-500/50 flex flex-col items-center justify-center"
        >
          <Zap className="w-10 h-10 text-indigo-400 mb-1" />
          <span className="text-indigo-300 font-bold text-sm">路由</span>
          <span className="text-xs text-indigo-400/60">/app1/xxx</span>
        </motion.div>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          className="absolute inset-0"
        >
          {[0, 120, 240].map((angle, idx) => (
            <motion.div
              key={idx}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: SUB_APPS[idx].color,
                top: '50%',
                left: '50%',
                transform: `rotate(${angle}deg) translateY(-80px) rotate(-${angle}deg)`,
              }}
            />
          ))}
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-emerald-500/50"
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-4 left-0 right-0 text-center"
      >
        <span className="text-xs text-slate-500">
          路由系统匹配 /app1 路径，激活商品中心子应用
        </span>
      </motion.div>
    </div>
  );
}

function LoadResourcesAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="w-16 h-16 bg-cyan-500/20 rounded-full border-2 border-cyan-500/50 flex items-center justify-center mb-2"
          >
            <Loader2 className="w-8 h-8 text-cyan-400" />
          </motion.div>
          <span className="text-cyan-300 text-sm font-medium">资源服务器</span>
        </div>

        <div className="flex flex-col gap-4">
          {[
            { name: 'app1.js', size: '245 KB' },
            { name: 'app1.css', size: '32 KB' },
            { name: 'vendor.js', size: '156 KB' },
          ].map((file, idx) => (
            <motion.div
              key={file.name}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ 
                delay: idx * 0.5, 
                repeat: Infinity, 
                repeatDelay: 2,
                duration: 1 
              }}
              className="flex items-center gap-3 px-4 py-2 bg-slate-700/50 rounded-xl"
            >
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-300">{file.name}</span>
              <span className="text-xs text-slate-500">{file.size}</span>
              <motion.div
                animate={{ width: ['0%', '100%'] }}
                transition={{ delay: idx * 0.5 + 0.3, repeat: Infinity, repeatDelay: 2, duration: 0.8 }}
                className="h-1 bg-cyan-500 rounded-full"
                style={{ width: '60px' }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="absolute bottom-4 left-0 right-0 text-center"
      >
        <span className="text-xs text-slate-500">
          动态加载子应用的 JavaScript 和 CSS 资源文件
        </span>
      </motion.div>
    </div>
  );
}

function CreateSandboxAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="relative"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 0 0 rgba(16, 185, 129, 0.4)',
                '0 0 0 20px rgba(16, 185, 129, 0)',
                '0 0 0 0 rgba(16, 185, 129, 0)'
              ]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-48 h-48 bg-emerald-500/10 rounded-3xl border-2 border-emerald-500/50 flex flex-col items-center justify-center"
          >
            <Shield className="w-12 h-12 text-emerald-400 mb-2" />
            <span className="text-emerald-300 font-bold">JS 沙箱</span>
            <span className="text-xs text-emerald-400/60 mt-1">隔离环境</span>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="px-2 py-1 bg-emerald-500/20 rounded text-xs text-emerald-300">
                window Proxy
              </div>
              <div className="px-2 py-1 bg-emerald-500/20 rounded text-xs text-emerald-300">
                Shadow DOM
              </div>
              <div className="px-2 py-1 bg-emerald-500/20 rounded text-xs text-emerald-300">
                样式隔离
              </div>
              <div className="px-2 py-1 bg-emerald-500/20 rounded text-xs text-emerald-300">
                事件隔离
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-4 left-0 right-0 text-center"
      >
        <span className="text-xs text-slate-500">
          创建独立的 JS 执行环境，防止全局变量污染
        </span>
      </motion.div>
    </div>
  );
}

function MountAppAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex items-center gap-8">
        <motion.div
          className="flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ repeat: Infinity, repeatDelay: 1, duration: 0.8 }}
            className="w-20 h-20 bg-amber-500/20 rounded-2xl border-2 border-amber-500/50 flex flex-col items-center justify-center mb-2"
          >
            <Box className="w-8 h-8 text-amber-400" />
          </motion.div>
          <span className="text-amber-300 text-sm font-medium">子应用</span>
        </motion.div>

        <motion.div
          animate={{ 
            scaleY: [0, 1, 1],
            opacity: [0, 1, 1]
          }}
          transition={{ repeat: Infinity, repeatDelay: 1, duration: 0.5 }}
          className="w-1 h-16 bg-gradient-to-b from-amber-500 to-indigo-500 rounded-full"
        />

        <div className="relative">
          <div className="w-48 h-32 bg-indigo-500/10 rounded-2xl border-2 border-indigo-500/30 flex flex-col items-center justify-center">
            <div className="text-indigo-400 text-sm mb-2">主应用容器</div>
            <div className="w-40 h-16 bg-slate-900/50 rounded-lg border border-dashed border-indigo-500/30 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, repeat: Infinity, repeatDelay: 1, duration: 0.5 }}
                className="w-36 h-14 bg-amber-500/20 rounded-lg border-2 border-amber-500/50 flex items-center justify-center"
              >
                <span className="text-amber-300 text-sm font-medium">商品中心</span>
              </motion.div>
            </div>
          </div>
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500"
          >
            #micro-app-container
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-4 left-0 right-0 text-center"
      >
        <span className="text-xs text-slate-500">
          子应用渲染到主应用指定的 DOM 容器中
        </span>
      </motion.div>
    </div>
  );
}

function LifecycleRunningAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <motion.div
          animate={{ boxShadow: ['0 0 20px rgba(34, 197, 94, 0.2)', '0 0 40px rgba(34, 197, 94, 0.4)', '0 0 20px rgba(34, 197, 94, 0.2)'] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-64 h-40 bg-emerald-500/10 rounded-2xl border-2 border-emerald-500/30 flex flex-col"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-500/20">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs text-slate-400">商品中心 - 运行中</span>
          </div>

          <div className="flex-1 p-3 flex items-center justify-center">
            <div className="flex gap-2">
              {['首页', '列表', '详情'].map((page, idx) => (
                <motion.div
                  key={page}
                  animate={{ 
                    backgroundColor: idx === 1 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(51, 65, 85, 0.5)',
                    borderColor: idx === 1 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(71, 85, 105, 0.5)'
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatDelay: 0.5,
                    delay: idx * 0.3,
                    duration: 1.5 
                  }}
                  className="px-3 py-2 rounded-lg border text-xs text-slate-300"
                >
                  {page}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="absolute -inset-2">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-emerald-500"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: i * 0.3
              }}
              style={{
                top: i % 2 === 0 ? 0 : 'auto',
                bottom: i % 2 === 1 ? 0 : 'auto',
                left: i < 2 ? 0 : 'auto',
                right: i >= 2 ? 0 : 'auto',
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="absolute bottom-4 left-0 right-0 text-center"
      >
        <span className="text-xs text-slate-500">
          子应用独立运行，内部路由和状态自主管理
        </span>
      </motion.div>
    </div>
  );
}

function RouteSwitchAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex items-center gap-6">
        <motion.div
          animate={{ x: [0, 0, -30], opacity: [1, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-24 bg-indigo-500/20 rounded-xl border-2 border-indigo-500/50 flex flex-col items-center justify-center">
            <Box className="w-6 h-6 text-indigo-400 mb-1" />
            <span className="text-indigo-300 text-xs font-medium">商品中心</span>
          </div>
          <span className="text-xs text-slate-500 mt-1">/app1</span>
        </motion.div>

        <motion.div
          animate={{ rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="w-12 h-12 bg-purple-500/20 rounded-full border-2 border-purple-500/50 flex items-center justify-center"
        >
          <RefreshCw className="w-6 h-6 text-purple-400" />
        </motion.div>

        <motion.div
          animate={{ x: [30, 0, 0], opacity: [0, 1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-24 bg-emerald-500/20 rounded-xl border-2 border-emerald-500/50 flex flex-col items-center justify-center">
            <Box className="w-6 h-6 text-emerald-400 mb-1" />
            <span className="text-emerald-300 text-xs font-medium">订单系统</span>
          </div>
          <span className="text-xs text-slate-500 mt-1">/app2</span>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-4 left-0 right-0 text-center"
      >
        <span className="text-xs text-slate-500">
          路由切换：从商品中心切换到订单系统
        </span>
      </motion.div>
    </div>
  );
}

function CommunicationAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(236, 72, 153, 0.2)', '0 0 40px rgba(236, 72, 153, 0.4)', '0 0 20px rgba(236, 72, 153, 0.2)'] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-24 h-32 bg-pink-500/20 rounded-2xl border-2 border-pink-500/50 flex flex-col items-center justify-center"
          >
            <Box className="w-8 h-8 text-pink-400 mb-1" />
            <span className="text-pink-300 text-sm font-bold">主应用</span>
            <span className="text-xs text-pink-400/60">发送方</span>
          </motion.div>
        </div>

        <div className="relative">
          <motion.div
            animate={{ x: [-50, 50], opacity: [0, 1, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute top-1/2 -translate-y-1/2"
          >
            <div className="px-3 py-2 bg-pink-500/30 rounded-lg border border-pink-500/50">
              <span className="text-pink-300 text-xs font-medium">
                {`{ user: '张三', token: 'xxx' }`}
              </span>
            </div>
          </motion.div>

          <motion.div
            animate={{ scaleX: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-32 h-0.5 bg-gradient-to-r from-pink-500 to-amber-500 rounded-full"
          />

          <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
        </div>

        <div className="flex flex-col items-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2, delay: 1 }}
            className="w-24 h-32 bg-amber-500/20 rounded-2xl border-2 border-amber-500/50 flex flex-col items-center justify-center"
          >
            <Box className="w-8 h-8 text-amber-400 mb-1" />
            <span className="text-amber-300 text-sm font-bold">子应用</span>
            <span className="text-xs text-amber-400/60">接收方</span>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-4 left-0 right-0 text-center"
      >
        <span className="text-xs text-slate-500">
          基于 CustomEvent 的事件总线实现跨应用通信
        </span>
      </motion.div>
    </div>
  );
}

function UnmountAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1, 0.8], opacity: [1, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-24 bg-orange-500/20 rounded-xl border-2 border-orange-500/50 flex flex-col items-center justify-center"
        >
          <Box className="w-6 h-6 text-orange-400 mb-1 rotate-180" />
          <span className="text-orange-300 text-sm font-medium">商品中心</span>
        </motion.div>

        <div className="w-64 h-40 bg-indigo-500/10 rounded-2xl border-2 border-indigo-500/30 flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-indigo-500/20">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs text-slate-400">主应用容器</span>
          </div>

          <div className="flex-1 p-3 flex items-center justify-center">
            <motion.div
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-40 h-16 bg-slate-900/50 rounded-lg border border-dashed border-indigo-500/30 flex items-center justify-center"
            >
              <span className="text-xs text-slate-600">容器已清空</span>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-4 left-0 right-0 text-center"
      >
        <span className="text-xs text-slate-500">
          调用 unmount 生命周期，移除子应用 DOM 节点
        </span>
      </motion.div>
    </div>
  );
}

function DestroyAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 0.95, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="relative"
      >
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 0 0 rgba(239, 68, 68, 0.4)',
              '0 0 0 30px rgba(239, 68, 68, 0)',
              '0 0 0 0 rgba(239, 68, 68, 0)'
            ]
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-32 h-32 bg-rose-500/20 rounded-3xl border-2 border-rose-500/50 flex flex-col items-center justify-center"
        >
          <Trash2 className="w-10 h-10 text-rose-400 mb-2" />
          <span className="text-rose-300 font-bold">销毁</span>
          <span className="text-xs text-rose-400/60">清理资源</span>
        </motion.div>

        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-rose-500"
            animate={{
              x: [0, Math.cos(i * 60 * Math.PI / 180) * 60],
              y: [0, Math.sin(i * 60 * Math.PI / 180) * 60],
              opacity: [1, 0],
              scale: [1, 0]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              top: '50%',
              left: '50%',
              marginLeft: -4,
              marginTop: -4,
            }}
          />
        ))}
      </motion.div>

      <motion.div
        className="absolute bottom-4 left-0 right-0 text-center"
      >
        <span className="text-xs text-slate-500">
          销毁沙箱、释放样式隔离容器、卸载动态资源
        </span>
      </motion.div>
    </div>
  );
}

function Boxes({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19.9v-5.15a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0Z"/>
      <path d="M7 16.5v-5.2"/>
      <path d="M17.97 12.92A2 2 0 0 0 17 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L22 19.9v-5.15a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0Z"/>
      <path d="M14.97 4.42A2 2 0 0 0 14 6.13v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0Z"/>
      <path d="M11 8.5V3.35a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8A2 2 0 0 0 1 3.35V8.5a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0l3-1.8A2 2 0 0 0 11 8.5Z"/>
      <path d="M7 16.5v-5.2"/>
      <path d="M7 3.4v5.2"/>
    </svg>
  );
}
