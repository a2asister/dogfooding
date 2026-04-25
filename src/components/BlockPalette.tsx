import { motion } from 'framer-motion';
import type { BlockType } from '@/types';
import { createBlock, blockTemplates, blockDescriptions } from '@/data/blocks';

interface BlockPaletteProps {
  availableBlocks: BlockType[];
  onBlockClick: (block: ReturnType<typeof createBlock>) => void;
}

export function BlockPalette({ availableBlocks, onBlockClick }: BlockPaletteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-4 p-6 bg-surface rounded-3xl kid-friendly-shadow overflow-y-auto max-h-full"
    >
      <h2 className="text-xl font-bold text-text text-center">🧩 积木工具箱</h2>
      
      <div className="flex flex-col gap-3">
        {availableBlocks.map((blockType) => {
          const template = blockTemplates[blockType];
          const description = blockDescriptions[blockType];
          const block = createBlock(blockType);
          
          return (
            <motion.button
              key={blockType}
              whileTap={{ scale: 0.95 }}
              onClick={() => onBlockClick(block)}
              className="w-full text-left"
            >
              <div
                className="relative p-4 rounded-2xl kid-friendly-shadow kid-friendly-btn"
                style={{
                  backgroundColor: `var(--color-${template.color})`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 flex-shrink-0">
                    <span className="text-2xl">{description.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{description.name}</span>
                    </div>
                    <p className="text-sm text-white/90 mt-1 leading-tight">
                      {description.description}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-center">
                  <div className="px-4 py-1 bg-white/20 rounded-full">
                    <span className="text-xs text-white font-medium">点击添加</span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-2 p-4 bg-background rounded-2xl">
        <p className="text-sm text-text-light text-center">
          💡 点击积木添加到工作区
        </p>
        <p className="text-xs text-text-light/70 text-center mt-1">
          拖拽可以调整执行顺序
        </p>
      </div>
    </motion.div>
  );
}
