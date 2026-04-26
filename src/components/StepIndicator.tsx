import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Info } from 'lucide-react';
import { useAnimation } from '../contexts/AnimationContext';
import { ANIMATION_STEPS } from '../types';

export function StepIndicator() {
  const { state, goToStep } = useAnimation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
    >
      <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
        <Info className="w-4 h-4" />
        流程步骤
      </h3>

      <div className="space-y-2">
        {ANIMATION_STEPS.map((step, index) => {
          const isActive = state.currentStep === index;
          const isPast = state.currentStep > index;
          const isFuture = state.currentStep < index;

          return (
            <motion.div
              key={step.id}
              initial={false}
              onClick={() => goToStep(index)}
              className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                isActive
                  ? 'bg-indigo-500/20 border border-indigo-500/50'
                  : isPast
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20'
                  : 'hover:bg-slate-700/50'
              }`}
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                className={`relative flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                  isActive
                    ? 'bg-indigo-500 shadow-lg shadow-indigo-500/50'
                    : isPast
                    ? 'bg-emerald-500'
                    : 'bg-slate-600 group-hover:bg-slate-500'
                }`}
              >
                {isPast ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <span className={`text-sm font-bold ${
                    isActive ? 'text-white' : isFuture ? 'text-slate-400' : 'text-white'
                  }`}>
                    {index + 1}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeStepIndicator"
                    className="absolute inset-0 rounded-full bg-indigo-400/30 pulse-ring"
                  />
                )}
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium truncate ${
                    isActive ? 'text-indigo-400' : isPast ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-slate-500 mt-1"
                    >
                      {step.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {index < ANIMATION_STEPS.length - 1 && (
                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${
                  isPast ? 'text-emerald-500' : 'text-slate-600'
                }`} />
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {state.currentStep >= 0 && state.currentStep < ANIMATION_STEPS.length && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700"
          >
            <h4 className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-2">
              当前阶段详情
            </h4>
            <ul className="space-y-1.5">
              {ANIMATION_STEPS[state.currentStep].details.map((detail, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <span className="text-indigo-400 mt-1 flex-shrink-0">•</span>
                  {detail}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
