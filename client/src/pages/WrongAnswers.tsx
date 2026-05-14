import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { WrongAnswer } from '../types';

export function WrongAnswers() {
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);

  useEffect(() => {
    fetchWrongAnswers();
  }, []);

  const fetchWrongAnswers = async () => {
    try {
      const res = await axios.get<WrongAnswer[]>('/api/game/wrong-answers');
      setWrongAnswers(res.data);
    } catch (error) {
      console.error('Failed to fetch wrong answers:', error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <Link to="/">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 px-6 py-3 bg-slate-700/50 rounded-xl hover:bg-slate-600/50 transition-colors"
        >
          ← 返回首页
        </motion.button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">📝 错题本</h1>
        <p className="text-gray-400">记录你的每一次错误，从中学习成长</p>
      </motion.div>

      {wrongAnswers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-bold mb-2">太棒了！</h2>
          <p className="text-gray-400">你还没有错题记录，继续保持！</p>
        </motion.div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          {wrongAnswers.map((wa, index) => (
            <motion.div
              key={wa.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-bold">
                  第 {wa.levelId} 关
                </span>
                <span className="text-gray-500 text-sm">
                  {new Date(wa.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-lg font-medium mb-4">{wa.question}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-500/10 rounded-xl">
                  <div className="text-red-400 text-sm mb-1">你的答案</div>
                  <div className="font-bold">{wa.userAnswer}</div>
                </div>
                <div className="p-4 bg-green-500/10 rounded-xl">
                  <div className="text-green-400 text-sm mb-1">正确答案</div>
                  <div className="font-bold">{wa.correctAnswer}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
