import { motion, AnimatePresence } from 'framer-motion';

interface ControlsProps {
  isPlaying: boolean;
  speed: 0.5 | 1 | 1.5 | 2;
  currentIndex: number;
  totalSteps: number;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onSpeedChange: (speed: 0.5 | 1 | 1.5 | 2) => void;
}

const speedOptions: { value: 0.5 | 1 | 1.5 | 2; label: string }[] = [
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
];

function Controls({
  isPlaying,
  speed,
  currentIndex,
  totalSteps,
  onPlayPause,
  onPrev,
  onNext,
  onReset,
  onSpeedChange,
}: ControlsProps) {
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === totalSteps - 1;

  return (
    <div className="bg-surface-elevated border-t border-border shrink-0">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">
              步骤: <span className="font-semibold text-text-primary">{currentIndex + 1}</span> / {totalSteps}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReset}
              className="p-2 rounded-lg bg-surface-card text-text-secondary hover:text-text-primary transition-colors"
              title="重置"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.button>

            <motion.button
              whileHover={!isFirstStep ? { scale: 1.05 } : {}}
              whileTap={!isFirstStep ? { scale: 0.95 } : {}}
              onClick={onPrev}
              disabled={isFirstStep}
              className={`p-2 rounded-lg transition-colors ${
                isFirstStep
                  ? 'bg-surface-card text-text-muted cursor-not-allowed'
                  : 'bg-surface-card text-text-secondary hover:text-text-primary'
              }`}
              title="上一步"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPlayPause}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary-dark flex items-center justify-center text-white shadow-lg transition-colors"
              title={isPlaying ? '暂停' : '播放'}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isPlaying ? 'pause' : 'play'}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileHover={!isLastStep ? { scale: 1.05 } : {}}
              whileTap={!isLastStep ? { scale: 0.95 } : {}}
              onClick={onNext}
              disabled={isLastStep}
              className={`p-2 rounded-lg transition-colors ${
                isLastStep
                  ? 'bg-surface-card text-text-muted cursor-not-allowed'
                  : 'bg-surface-card text-text-secondary hover:text-text-primary'
              }`}
              title="下一步"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">速度:</span>
            <div className="flex items-center gap-1 bg-surface-card rounded-lg p-1">
              {speedOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={speed !== option.value ? { scale: 1.05 } : {}}
                  whileTap={speed !== option.value ? { scale: 0.95 } : {}}
                  onClick={() => onSpeedChange(option.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    speed === option.value
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Controls;
