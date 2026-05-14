import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Level, Score } from '../types';
import { ProgressBar } from '../components/ProgressBar';

export function Home() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [score, setScore] = useState<Score | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [levelsRes, scoreRes] = await Promise.all([
        axios.get<Level[]>('/api/levels'),
        axios.get<Score>('/api/game/score'),
      ]);
      setLevels(levelsRes.data);
      setScore(scoreRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const completedCount = levels.filter(l => !l.isUnlocked && l.id < levels.find(lv => lv.isUnlocked)?.id || false).length;
  const unlockedCount = levels.filter(l => l.isUnlocked).length;

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500">
          🧠 逻辑推理闯关
        </h1>
        <p className="text-gray-300 text-lg">趣味训练逻辑思维，挑战你的智力极限！</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
      >
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30">
          <div className="text-4xl mb-2">⭐</div>
          <div className="text-3xl font-bold text-yellow-400">{score?.totalPoints || 0}</div>
          <div className="text-gray-400">总积分</div>
        </div>
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-3xl font-bold text-cyan-400">{score?.completedLevels || 0}</div>
          <div className="text-gray-400">已通关</div>
        </div>
        <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/30">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-3xl font-bold text-pink-400">{score?.streak || 0}</div>
          <div className="text-gray-400">连续正确</div>
        </div>
      </motion.div>

      <ProgressBar current={score?.completedLevels || 0} total={levels.length || 5} />

      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">选择关卡</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              {level.isUnlocked ? (
                <Link to={`/level/${level.id}`}>
                  <div className="group bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/50 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1 cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-3xl">🎯</span>
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-bold">
                        +{level.points}分
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                      第{level.id}关：{level.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">{level.description}</p>
                    <div className="flex gap-1">
                      {Array.from({ length: level.difficulty }).map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                      {Array.from({ length: 3 - level.difficulty }).map((_, i) => (
                        <span key={i} className="text-gray-600">★</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 opacity-60">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl">🔒</span>
                    <span className="px-3 py-1 bg-gray-600/30 text-gray-500 rounded-full text-sm font-bold">
                      未解锁
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-500">
                    第{level.id}关：{level.title}
                  </h3>
                  <p className="text-gray-600 text-sm">完成上一关解锁此关卡</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link to="/wrong-answers">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl font-bold text-lg shadow-lg hover:shadow-red-500/30 transition-all"
          >
            📝 查看错题本
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
