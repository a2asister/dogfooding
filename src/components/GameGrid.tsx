import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Home, ChevronRight } from 'lucide-react';
import type { CharacterState, Level, Direction } from '@/types';

const directionRotation: Record<Direction, number> = {
  up: -90,
  right: 0,
  down: 90,
  left: 180,
};

interface GameGridProps {
  level: Level;
  characterState: CharacterState;
  isRunning: boolean;
  isCompleted: boolean;
  onRun: () => void;
  onReset: () => void;
  onBack: () => void;
  onNextLevel: () => void;
  hasNextLevel: boolean;
  showSuccess: boolean;
}

export function GameGrid({
  level,
  characterState,
  isRunning,
  isCompleted,
  onRun,
  onReset,
  onBack,
  onNextLevel,
  hasNextLevel,
  showSuccess,
}: GameGridProps) {
  const { gridSize, goalPosition, obstacles } = level;
  const cellSize = Math.min(60, 360 / Math.max(gridSize.width, gridSize.height));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full bg-surface rounded-3xl kid-friendly-shadow overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b-2 border-background">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 bg-background rounded-xl kid-friendly-btn"
          >
            <Home className="w-6 h-6 text-text" />
          </motion.button>
          <div>
            <h2 className="text-lg font-bold text-text">
              第 {level.id} 关：{level.name}
            </h2>
            <p className="text-sm text-text-light">{level.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`
            px-3 py-1 rounded-full text-sm font-bold
            ${level.difficulty === 'easy' ? 'bg-green-100 text-green-600' : ''}
            ${level.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' : ''}
            ${level.difficulty === 'hard' ? 'bg-red-100 text-red-600' : ''}
          `}>
            {level.difficulty === 'easy' ? '简单' : level.difficulty === 'medium' ? '中等' : '困难'}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background/50 relative overflow-hidden">
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-50"
            >
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="bg-surface rounded-3xl p-8 text-center kid-friendly-shadow"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: 2, delay: 0.5 }}
                  className="text-8xl mb-4"
                >
                  🎉
                </motion.div>
                <h2 className="text-3xl font-bold text-text mb-2">太棒了！</h2>
                <p className="text-text-light mb-6 text-lg">你成功完成了这一关！</p>
                <div className="flex gap-4 justify-center">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onReset}
                    className="flex items-center gap-2 px-6 py-3 bg-background text-text rounded-2xl font-bold kid-friendly-btn"
                  >
                    <RotateCcw className="w-5 h-5" />
                    再玩一次
                  </motion.button>
                  {hasNextLevel && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={onNextLevel}
                      className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-2xl font-bold kid-friendly-btn"
                    >
                      下一关
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="relative bg-surface rounded-2xl kid-friendly-shadow p-4"
          style={{
            width: cellSize * gridSize.width + 32,
            height: cellSize * gridSize.height + 32,
          }}
        >
          <div
            className="grid gap-0.5 bg-background p-0.5 rounded-xl"
            style={{
              gridTemplateColumns: `repeat(${gridSize.width}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${gridSize.height}, ${cellSize}px)`,
            }}
          >
            {Array.from({ length: gridSize.height * gridSize.width }).map((_, index) => {
              const x = index % gridSize.width;
              const y = Math.floor(index / gridSize.width);
              
              const isGoal = x === goalPosition.x && y === goalPosition.y;
              const isObstacle = obstacles.some((obs) => obs.x === x && obs.y === y);

              return (
                <div
                  key={`${x}-${y}`}
                  className={`
                    flex items-center justify-center rounded-lg
                    transition-colors duration-200
                    ${isObstacle ? 'bg-gray-300' : 'bg-surface'}
                  `}
                  style={{ width: cellSize, height: cellSize }}
                >
                  {isGoal && !isCompleted && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-2xl"
                    >
                      ⭐
                    </motion.div>
                  )}
                  {isObstacle && <div className="text-xl">🧱</div>}
                </div>
              );
            })}
          </div>

          <div
            className="absolute pointer-events-none flex items-center justify-center"
            style={{
              width: cellSize,
              height: cellSize,
              left: 16 + characterState.position.x * (cellSize + 2),
              top: 16 + characterState.position.y * (cellSize + 2),
              transition: 'left 0.4s ease, top 0.4s ease',
            }}
          >
            <motion.div
              animate={characterState.isJumping ? { y: [-15, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="text-4xl"
              style={{ 
                transform: `rotate(${directionRotation[characterState.direction]}deg)`,
                transformOrigin: 'center',
              }}
            >
              🐰
            </motion.div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-text-light">
          <div className="flex items-center gap-1">
            <span className="text-lg">🐰</span>
            <span className="text-sm">小兔子</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1">
            <span className="text-lg">⭐</span>
            <span className="text-sm">目标</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1">
            <span className="text-lg">🧱</span>
            <span className="text-sm">障碍物</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 px-6 py-4 border-t-2 border-background bg-background/50">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          disabled={isRunning}
          className="flex items-center gap-2 px-8 py-4 bg-background text-text rounded-2xl font-bold text-lg kid-friendly-btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-6 h-6" />
          重置
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-12 py-4 bg-primary text-white rounded-2xl font-bold text-lg kid-friendly-btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-6 h-6" />
          {isRunning ? '运行中...' : '运行'}
        </motion.button>
      </div>
    </motion.div>
  );
}
