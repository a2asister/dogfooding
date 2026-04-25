import { motion, AnimatePresence } from 'framer-motion';
import { AnimationStep } from '@/types';

interface StepInfoProps {
  step: AnimationStep | undefined;
  steps: AnimationStep[];
  currentIndex: number;
  progress: number;
  onStepClick: (index: number) => void;
}

function StepInfo({ step, steps, currentIndex, progress, onStepClick }: StepInfoProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border bg-surface-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-secondary">流程进度</span>
          <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step && (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-auto p-4"
          >
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                  step.phase === 'dev' ? 'bg-accent/20 text-accent' : 'bg-secondary/20 text-secondary'
                }`}>
                  {step.phase === 'dev' ? '开发模式' : '生产构建'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-3">
                {step.title}
              </h3>
              <div className="bg-surface-card rounded-xl p-4">
                <p className="text-text-secondary leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-border shrink-0">
        <div className="px-4 py-2 border-b border-border bg-surface-card">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            步骤列表
          </span>
        </div>
        <div className="overflow-auto max-h-48">
          {steps.map((s, index) => (
            <motion.button
              key={s.id}
              whileHover={{ backgroundColor: 'rgba(100, 108, 255, 0.05)' }}
              onClick={() => onStepClick(index)}
              className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors ${
                index === currentIndex
                  ? 'bg-primary/10 border-l-2 border-primary'
                  : 'border-l-2 border-transparent hover:bg-surface-card'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                index === currentIndex
                  ? 'bg-primary text-white'
                  : index < currentIndex
                    ? 'bg-secondary/20 text-secondary'
                    : 'bg-surface-card text-text-muted'
              }`}>
                {index < currentIndex ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span className={`text-sm truncate ${
                index === currentIndex
                  ? 'text-text-primary font-medium'
                  : index < currentIndex
                    ? 'text-text-secondary'
                    : 'text-text-muted'
              }`}>
                {s.title.replace(/^\d+\.\s*/, '')}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StepInfo;
