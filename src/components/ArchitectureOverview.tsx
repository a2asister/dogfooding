import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Boxes, Check, X, ChevronRight } from 'lucide-react';
import { useAnimation } from '../contexts/AnimationContext';
import { MONOLITH_VS_MICROFRONTEND } from '../types';

export function ArchitectureOverview() {
  const { state, setArchitecture } = useAnimation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
    >
      <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
        架构总览对比
      </h3>

      <div className="flex gap-2 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setArchitecture('monolith')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
            state.architectureType === 'monolith'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          单体架构
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setArchitecture('microfrontend')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
            state.architectureType === 'microfrontend'
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Boxes className="w-4 h-4" />
          微前端架构
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={state.architectureType}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative min-h-48 py-6 mb-6 bg-slate-900/50 rounded-xl">
            {state.architectureType === 'monolith' ? (
              <MonolithVisualization />
            ) : (
              <MicrofrontendVisualization />
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                核心特点
              </h4>
              <div className="flex flex-wrap gap-2">
                {MONOLITH_VS_MICROFRONTEND[state.architectureType].characteristics.map((char, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-slate-700/50 text-slate-300 border border-slate-600"
                  >
                    <ChevronRight className="w-3 h-3 text-indigo-400" />
                    {char}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                <h4 className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">
                  优势
                </h4>
                <ul className="space-y-1.5">
                  {MONOLITH_VS_MICROFRONTEND[state.architectureType].pros.map((pro, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/30">
                <h4 className="text-xs font-medium text-rose-400 uppercase tracking-wider mb-2">
                  劣势
                </h4>
                <ul className="space-y-1.5">
                  {MONOLITH_VS_MICROFRONTEND[state.architectureType].cons.map((con, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                      <X className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function MonolithVisualization() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(244, 63, 94, 0.2)', '0 0 40px rgba(244, 63, 94, 0.4)', '0 0 20px rgba(244, 63, 94, 0.2)'] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="relative w-64 bg-gradient-to-br from-rose-500/20 to-rose-600/20 rounded-2xl border-2 border-rose-500/50 flex flex-col items-center py-4 px-3"
          >
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-6 h-6 text-rose-400" />
              <span className="text-rose-300 font-bold text-base">单体应用</span>
            </div>
            <span className="text-xs text-rose-400/60 mb-3">Monolithic Application</span>
            
            <div className="grid grid-cols-3 gap-2 w-full">
              {['商品', '订单', '用户', '支付', '营销', '报表'].map((module, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="px-2 py-2 bg-rose-500/20 rounded-lg text-xs text-rose-300 border border-rose-500/30 text-center font-medium"
                >
                  {module}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-center"
          >
            <span className="text-xs text-slate-500">
              所有模块耦合在一起，共享同一运行环境
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function MicrofrontendVisualization() {
  const { state } = useAnimation();

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative flex items-center gap-4"
      >
        <div className="relative">
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(99, 102, 241, 0.2)', '0 0 40px rgba(99, 102, 241, 0.4)', '0 0 20px rgba(99, 102, 241, 0.2)'] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-32 h-40 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-2xl border-2 border-indigo-500/50 flex flex-col items-center justify-center"
          >
            <Boxes className="w-8 h-8 text-indigo-400 mb-2" />
            <span className="text-indigo-300 font-bold text-sm">主应用</span>
            <span className="text-xs text-indigo-400/60">基座</span>
          </motion.div>
        </div>

        <div className="flex flex-col gap-2">
          {[
            { name: '商品中心', color: '#6366f1', active: state.activeApp === 'app1' },
            { name: '订单系统', color: '#10b981', active: state.activeApp === 'app2' },
            { name: '用户中心', color: '#f59e0b', active: state.activeApp === 'app3' },
          ].map((app, idx) => (
            <motion.div
              key={app.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                scale: app.active ? 1.05 : 1,
              }}
              transition={{ delay: idx * 0.15 }}
              className={`relative w-28 h-11 rounded-xl border-2 flex items-center justify-center transition-all ${
                app.active
                  ? 'bg-opacity-30 border-opacity-70'
                  : 'bg-slate-700/30 border-slate-600/30'
              }`}
              style={{
                backgroundColor: app.active ? `${app.color}30` : undefined,
                borderColor: app.active ? `${app.color}b3` : undefined,
                boxShadow: app.active ? `0 0 20px ${app.color}50` : undefined,
              }}
            >
              <span 
                className={`text-xs font-bold ${
                  app.active ? 'text-white' : 'text-slate-400'
                }`}
              >
                {app.name}
              </span>
              {app.active && (
                <motion.div
                  layoutId="activeAppIndicator"
                  className="absolute inset-0 rounded-xl pulse-ring"
                  style={{ backgroundColor: `${app.color}30` }}
                />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
        >
          <span className="text-xs text-slate-500">
            各子应用独立运行，通过主应用协调通信
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
