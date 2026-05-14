import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-between mb-2 text-sm">
        <span className="text-gray-300">闯关进度</span>
        <span className="text-yellow-400 font-bold">{current}/{total}</span>
      </div>
      <div className="h-4 bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            background: 'linear-gradient(90deg, #4ecdc4, #45b7d1, #96ceb4)',
            boxShadow: '0 0 10px rgba(78, 205, 196, 0.5)',
          }}
        />
      </div>
      <div className="text-center mt-2">
        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
          {percentage}%
        </span>
      </div>
    </div>
  );
}
