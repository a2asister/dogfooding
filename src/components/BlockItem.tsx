import { motion } from 'framer-motion';
import {
  ArrowUp,
  RotateCcw,
  RotateCw,
  ArrowUpCircle,
  Repeat,
  HelpCircle,
  GripVertical,
  X,
} from 'lucide-react';
import type { Block, BlockType } from '@/types';

const iconMap: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  move: ArrowUp,
  turnLeft: RotateCcw,
  turnRight: RotateCw,
  jump: ArrowUpCircle,
  loop: Repeat,
  condition: HelpCircle,
};

interface BlockItemProps {
  block: Block;
  isDragging?: boolean;
  isInWorkspace?: boolean;
  onRemove?: () => void;
  isLoop?: boolean;
  loopCount?: number;
  onLoopCountChange?: (count: number) => void;
}

export function BlockItem({
  block,
  isDragging,
  isInWorkspace = false,
  onRemove,
  isLoop = false,
  loopCount = 2,
  onLoopCountChange,
}: BlockItemProps) {
  const Icon = iconMap[block.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`
        relative flex items-center gap-3 px-6 py-4 rounded-2xl
        kid-friendly-shadow kid-friendly-btn select-none
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isInWorkspace ? 'w-full min-w-[180px]' : 'min-w-[120px]'}
      `}
      style={{
        backgroundColor: `var(--color-${block.color})`,
      }}
    >
      {isInWorkspace && (
        <div className="drag-handle cursor-grab active:cursor-grabbing p-1 rounded-lg bg-black/10">
          <GripVertical className="w-6 h-6 text-white" />
        </div>
      )}

      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
        <Icon className="w-6 h-6 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-lg font-bold text-white">{block.label}</span>
        {isLoop && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-white/80">重复</span>
            <select
              value={loopCount}
              onChange={(e) => onLoopCountChange?.(Number(e.target.value))}
              className="px-2 py-1 rounded-lg bg-white/20 text-white text-sm font-bold border-none outline-none cursor-pointer"
            >
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n} className="text-gray-800">
                  {n}
                </option>
              ))}
            </select>
            <span className="text-sm text-white/80">次</span>
          </div>
        )}
      </div>

      {isInWorkspace && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      )}
    </motion.div>
  );
}
