import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Gauge,
  FastForward
} from 'lucide-react';
import { useAnimation } from '../contexts/AnimationContext';
import { ANIMATION_STEPS } from '../types';

const speedOptions = [
  { value: 0.5, label: '0.5x', icon: <Gauge className="w-4 h-4" /> },
  { value: 1, label: '1x', icon: <Gauge className="w-4 h-4" /> },
  { value: 2, label: '2x', icon: <FastForward className="w-4 h-4" /> },
  { value: 3, label: '3x', icon: <FastForward className="w-4 h-4" /> },
];

export function ControlPanel() {
  const { 
    state, 
    play, 
    pause, 
    stop, 
    nextStep, 
    prevStep,
    setSpeed 
  } = useAnimation();

  const isAtEnd = state.currentStep >= ANIMATION_STEPS.length - 1;
  const isAtStart = state.currentStep <= -1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
    >
      <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
        动画控制
      </h3>
      
      <div className="flex items-center justify-center gap-3 mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevStep}
          disabled={isAtStart}
          className="p-3 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="上一步"
        >
          <SkipBack className="w-5 h-5 text-slate-200" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={stop}
          className="p-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors"
          title="重置"
        >
          <RotateCcw className="w-5 h-5 text-slate-200" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={state.isPlaying ? pause : play}
          disabled={isAtEnd}
          className={`p-4 rounded-2xl transition-all ${
            state.isPlaying 
              ? 'bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/30' 
              : 'bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/30'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={state.isPlaying ? '暂停' : '播放'}
        >
          {state.isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-0.5" />
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextStep}
          disabled={isAtEnd}
          className="p-3 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="下一步"
        >
          <SkipForward className="w-5 h-5 text-slate-200" />
        </motion.button>
      </div>

      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-slate-400 mr-2">播放速度:</span>
        {speedOptions.map((option) => (
          <motion.button
            key={option.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSpeed(option.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              state.speed === option.value
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {option.label}
          </motion.button>
        ))}
      </div>

      <div className="mt-4 text-center">
        <span className="text-sm text-slate-400">
          进度: <span className="text-indigo-400 font-mono">{Math.max(0, state.currentStep + 1)}</span> / {ANIMATION_STEPS.length}
        </span>
      </div>
    </motion.div>
  );
}
