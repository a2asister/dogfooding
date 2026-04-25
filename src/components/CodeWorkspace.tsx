import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Lightbulb } from 'lucide-react';
import type { Block } from '@/types';
import { BlockItem } from './BlockItem';

interface SortableBlockProps {
  block: Block;
  onRemove: () => void;
  onLoopCountChange?: (count: number) => void;
}

function SortableBlock({ block, onRemove, onLoopCountChange }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BlockItem
        block={block}
        isDragging={isDragging}
        isInWorkspace={true}
        onRemove={onRemove}
        isLoop={block.type === 'loop'}
        loopCount={block.count}
        onLoopCountChange={onLoopCountChange}
      />
    </div>
  );
}

interface CodeWorkspaceProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  onBlockRemove: (id: string) => void;
  onLoopCountChange: (id: string, count: number) => void;
  onClear: () => void;
  onHint: () => void;
  isRunning: boolean;
  hint: string;
  showHint: boolean;
}

export function CodeWorkspace({
  blocks,
  onBlocksChange,
  onBlockRemove,
  onLoopCountChange,
  onClear,
  onHint,
  isRunning,
  hint,
  showHint,
}: CodeWorkspaceProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (_event: DragStartEvent) => {
    // 可以在这里添加拖拽开始时的音效
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      onBlocksChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-surface rounded-3xl kid-friendly-shadow overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b-2 border-background">
        <h2 className="text-xl font-bold text-text">我的程序</h2>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onHint}
            className="flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent rounded-2xl font-bold kid-friendly-btn"
          >
            <Lightbulb className="w-5 h-5" />
            <span>提示</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClear}
            disabled={isRunning || blocks.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-500 rounded-2xl font-bold kid-friendly-btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-5 h-5" />
            <span>清空</span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-accent/10 border-b-2 border-accent/20"
          >
            <div className="px-6 py-4">
              <p className="text-text font-medium">
                💡 <span className="font-bold">提示：</span>
                {hint}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 p-6 overflow-y-auto">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-light">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🎯
            </motion.div>
            <p className="text-lg text-center">点击左边的积木</p>
            <p className="text-lg text-center">添加到这里开始编程吧！</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-3">
                {blocks.map((block, index) => (
                  <div key={block.id} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-14 bg-background rounded-xl text-text-light font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <SortableBlock
                        block={block}
                        onRemove={() => onBlockRemove(block.id)}
                        onLoopCountChange={(count) => onLoopCountChange(block.id, count)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="px-6 py-4 border-t-2 border-background bg-background/50">
        <p className="text-sm text-text-light text-center">
          已添加 <span className="font-bold text-primary">{blocks.length}</span> 个积木
          {blocks.length > 0 && ' · 拖拽可以调整顺序'}
        </p>
      </div>
    </motion.div>
  );
}
