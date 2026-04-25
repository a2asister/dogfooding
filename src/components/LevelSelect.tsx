import { motion } from 'framer-motion';
import { Lock, Star, Trophy, BookOpen } from 'lucide-react';
import { levels } from '@/data/levels';
import type { Level } from '@/types';

interface LevelSelectProps {
  onSelectLevel: (level: Level) => void;
  unlockedLevels: number[];
  completedLevels: number[];
}

const difficultyColors = {
  easy: 'from-green-400 to-green-500',
  medium: 'from-yellow-400 to-orange-500',
  hard: 'from-red-400 to-red-500',
};

const difficultyLabels = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export function LevelSelect({ onSelectLevel, unlockedLevels, completedLevels }: LevelSelectProps) {
  const isUnlocked = (levelId: number) => unlockedLevels.includes(levelId);
  const isCompleted = (levelId: number) => completedLevels.includes(levelId);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background p-8 overflow-auto"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-8xl mb-4 inline-block"
          >
            🐰
          </motion.div>
          <h1 className="text-4xl font-bold text-text mb-2">
            开心编程乐园
          </h1>
          <p className="text-xl text-text-light">
            选择关卡，开始你的编程冒险之旅！
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {levels.map((level) => {
            const unlocked = isUnlocked(level.id);
            const completed = isCompleted(level.id);

            return (
              <motion.div
                key={level.id}
                variants={item}
                whileTap={unlocked ? { scale: 0.95 } : {}}
              >
                <button
                  onClick={() => unlocked && onSelectLevel(level)}
                  disabled={!unlocked}
                  className={`
                    w-full h-full p-6 rounded-3xl kid-friendly-shadow
                    transition-all duration-200
                    ${unlocked 
                      ? 'bg-surface hover:shadow-lg cursor-pointer kid-friendly-btn' 
                      : 'bg-gray-200 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-3
                        bg-gradient-to-br ${difficultyColors[level.difficulty]}
                        ${!unlocked ? 'opacity-50' : ''}
                      `}
                    >
                      {unlocked ? (
                        completed ? (
                          <Trophy className="w-8 h-8 text-white" />
                        ) : (
                          <span className="text-white">{level.id}</span>
                        )
                      ) : (
                        <Lock className="w-8 h-8 text-white/70" />
                      )}
                    </div>

                    <h3 className={`font-bold text-lg mb-1 ${!unlocked ? 'text-gray-400' : 'text-text'}`}>
                      {level.name}
                    </h3>

                    <p className={`text-sm mb-2 ${!unlocked ? 'text-gray-400' : 'text-text-light'}`}>
                      {level.description}
                    </p>

                    <div className="flex items-center gap-2">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-bold
                        ${level.difficulty === 'easy' ? 'bg-green-100 text-green-600' : ''}
                        ${level.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' : ''}
                        ${level.difficulty === 'hard' ? 'bg-red-100 text-red-600' : ''}
                        ${!unlocked ? 'opacity-50' : ''}
                      `}>
                        {difficultyLabels[level.difficulty]}
                      </span>
                    </div>

                    {completed && (
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3].map((star) => (
                          <Star
                            key={star}
                            className="w-5 h-5 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 space-y-6"
        >
          <div className="p-6 bg-surface rounded-3xl kid-friendly-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/20 rounded-2xl">
                <BookOpen className="w-8 h-8 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-text mb-4">🎯 游戏玩法说明</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-background rounded-2xl">
                    <h4 className="font-bold text-text mb-2">🎮 目标</h4>
                    <p className="text-text-light text-sm">
                      帮助小兔子 🐰 通过编程积木到达星星 ⭐ 的位置！
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-2xl">
                    <h4 className="font-bold text-text mb-2">🧩 如何操作</h4>
                    <p className="text-text-light text-sm">
                      1. 点击左侧积木添加到工作区<br/>
                      2. 拖拽可以调整积木顺序<br/>
                      3. 点击「运行」让小兔子执行
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-2xl">
                    <h4 className="font-bold text-text mb-2">📦 积木说明</h4>
                    <ul className="text-text-light text-sm space-y-1">
                      <li>🔴 <strong>前进</strong> - 小兔子向前走一步</li>
                      <li>🔵 <strong>左转/右转</strong> - 改变前进方向</li>
                      <li>🟡 <strong>跳跃</strong> - 跳过障碍物</li>
                      <li>🟣 <strong>循环</strong> - 重复执行动作</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-background rounded-2xl">
                    <h4 className="font-bold text-text mb-2">💡 小提示</h4>
                    <p className="text-text-light text-sm">
                      每关都有提示按钮，遇到困难点击它获取帮助！完成关卡可以解锁下一关。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-text-light text-sm"
        >
          <p>🐰 纯公益早教学习应用 · 无广告 · 无付费 · 绿色安全</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
