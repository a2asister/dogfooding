import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Level } from '../types';
import { Particles } from '../components/Particles';
import { UnlockExplosion } from '../components/UnlockExplosion';
import { FlowLine } from '../components/FlowLine';

export function GameLevel() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [level, setLevel] = useState<Level | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [particlePos, setParticlePos] = useState({ x: 0, y: 0 });
  const [showExplosion, setShowExplosion] = useState(false);
  const [showFlow, setShowFlow] = useState(false);
  const [flowPos, setFlowPos] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });
  const [showHint, setShowHint] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setShowResult(false);
    setShowParticles(false);
    setShowExplosion(false);
    setShowFlow(false);
    setSelectedOption(null);
    setUserAnswer('');
    setShowHint(false);
    fetchLevel();
  }, [id]);

  const fetchLevel = async () => {
    try {
      const res = await axios.get<Level>(`/api/levels/${id}`);
      setLevel(res.data);
    } catch (error) {
      console.error('Failed to fetch level:', error);
    }
  };

  const handleSubmit = () => {
    if (!level) return;
    
    const answer = level.question.type === 'choice' ? selectedOption : userAnswer;
    if (!answer) return;

    const correct = answer === level.question.answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setParticlePos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setShowParticles(true);
      
      setTimeout(() => {
        setShowExplosion(true);
      }, 800);

      setTimeout(() => {
        setFlowPos({
          startX: rect.left + rect.width / 2,
          startY: rect.top + rect.height / 2,
          endX: window.innerWidth / 2,
          endY: 100,
        });
        setShowFlow(true);
      }, 1200);
    }

    axios.post('/api/levels/submit', {
      levelId: level.id,
      userAnswer: answer,
      correctAnswer: level.question.answer,
      question: level.question.content,
      isCorrect: correct,
      points: level.points,
    });
  };

  const handleNext = () => {
    setShowResult(false);
    setShowParticles(false);
    setShowExplosion(false);
    setShowFlow(false);
    setSelectedOption(null);
    setUserAnswer('');
    
    if (level && level.id < 5) {
      navigate(`/level/${level.id + 1}`);
    } else {
      navigate('/');
    }
  };

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      <Particles trigger={showParticles} x={particlePos.x} y={particlePos.y} />
      <UnlockExplosion trigger={showExplosion} />
      <FlowLine {...flowPos} trigger={showFlow} />

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        className="mb-8 px-6 py-3 bg-slate-700/50 rounded-xl hover:bg-slate-600/50 transition-colors"
      >
        ← 返回首页
      </motion.button>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 rounded-full mb-4">
            <span className="text-cyan-400">第 {level.id} 关</span>
            <span className="text-yellow-400">+{level.points} 分</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{level.title}</h1>
          <p className="text-gray-400">{level.description}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-slate-700/60 to-slate-800/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-600/50 shadow-2xl"
        >
          <div className="text-xl md:text-2xl font-medium mb-8 text-center leading-relaxed">
            {level.question.content}
          </div>

          {level.question.type === 'choice' ? (
            <div className="grid gap-4 mb-8">
              {level.question.options?.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedOption(option)}
                  className={`p-5 rounded-xl text-left transition-all duration-300 ${
                    selectedOption === option
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-600/50 hover:bg-slate-500/50 border border-slate-500/30'
                  }`}
                >
                  <span className="font-bold mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="mb-8">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="请输入你的答案..."
                className="w-full p-5 bg-slate-600/50 rounded-xl border border-slate-500/30 focus:border-cyan-400 focus:outline-none text-lg transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          )}

          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHint(!showHint)}
              className="px-6 py-3 bg-slate-600/50 rounded-xl hover:bg-slate-500/50 transition-colors"
            >
              💡 提示
            </motion.button>
            <motion.button
              ref={buttonRef}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!selectedOption && !userAnswer}
              className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${
                selectedOption || userAnswer
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              提交答案
            </motion.button>
          </div>

          <AnimatePresence>
            {showHint && level.question.hints && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30"
              >
                <h4 className="text-yellow-400 font-bold mb-2">💡 提示</h4>
                <ul className="text-gray-300 space-y-1">
                  {level.question.hints.map((hint, i) => (
                    <li key={i}>• {hint}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`max-w-md w-full p-8 rounded-3xl text-center ${
                isCorrect
                  ? 'bg-gradient-to-br from-green-600 to-emerald-700'
                  : 'shake bg-gradient-to-br from-red-600 to-rose-700'
              }`}
            >
              <div className="text-6xl mb-4">
                {isCorrect ? '🎉' : '😅'}
              </div>
              <h2 className="text-3xl font-bold mb-4">
                {isCorrect ? '回答正确！' : '回答错误'}
              </h2>
              {!isCorrect && (
                <p className="text-xl mb-6 opacity-90">
                  正确答案是：<span className="font-bold">{level.question.answer}</span>
                </p>
              )}
              {isCorrect && (
                <p className="text-xl mb-6 opacity-90">
                  获得 <span className="font-bold text-yellow-300">+{level.points}</span> 积分！
                </p>
              )}
              <div className="flex gap-4 justify-center">
                {isCorrect ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="px-8 py-4 bg-white text-green-700 rounded-xl font-bold text-lg"
                  >
                    {level.id < 5 ? '下一关 →' : '返回首页'}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowResult(false)}
                    className="px-8 py-4 bg-white text-red-700 rounded-xl font-bold text-lg"
                  >
                    再试一次
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/')}
                  className="px-8 py-4 bg-white/20 rounded-xl font-bold text-lg"
                >
                  返回
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
