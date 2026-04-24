import { useState, useCallback } from 'react';
import {
  HelpCircle,
  Check,
  X,
  Trophy,
  Star,
  BookOpen,
  Zap,
  Compass,
  GraduationCap,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { quizQuestions, initialBadges } from '../data/quiz';
import type { QuizQuestion, Badge } from '../types';

const badgeIconMap: Record<string, typeof Star> = {
  Star,
  BookOpen,
  Zap,
  Trophy,
  Compass,
  GraduationCap,
};

export function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [badges, setBadges] = useState<Badge[]>(initialBadges);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState<Badge | null>(null);
  const [showBadges, setShowBadges] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = quizQuestions[currentQuestionIndex];

  const checkBadges = useCallback(
    (newCorrectCount: number, newAnswered: Set<string>) => {
      const updatedBadges = [...badges];
      let newUnlock: Badge | null = null;

      if (newCorrectCount >= 1 && !updatedBadges[0].unlocked) {
        updatedBadges[0] = { ...updatedBadges[0], unlocked: true };
        newUnlock = updatedBadges[0];
      }
      if (newCorrectCount >= 5 && !updatedBadges[1].unlocked) {
        updatedBadges[1] = { ...updatedBadges[1], unlocked: true };
        newUnlock = updatedBadges[1];
      }
      if (newCorrectCount >= 10 && !updatedBadges[2].unlocked) {
        updatedBadges[2] = { ...updatedBadges[2], unlocked: true };
        newUnlock = updatedBadges[2];
      }
      if (newCorrectCount >= quizQuestions.length && !updatedBadges[3].unlocked) {
        updatedBadges[3] = { ...updatedBadges[3], unlocked: true };
        newUnlock = updatedBadges[3];
      }

      setBadges(updatedBadges);
      if (newUnlock) {
        setShowBadgeUnlock(newUnlock);
      }
    },
    [badges]
  );

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const newAnswered = new Set(answeredQuestions).add(currentQuestion.id);
    let newCorrectCount = correctCount;

    if (isCorrect && !answeredQuestions.has(currentQuestion.id)) {
      newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
    }

    setAnsweredQuestions(newAnswered);
    checkBadges(newCorrectCount, newAnswered);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuizCompleted(false);
  };

  const unlockedBadgeCount = badges.filter((b) => b.unlocked).length;

  if (quizCompleted) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4 md:p-8 animate-fade-in-up">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl text-center max-w-lg w-full border border-border-light">
          <div className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-6 bg-gradient-to-br from-primary-orange to-primary-light-orange rounded-full flex items-center justify-center shadow-lg">
            <Trophy className="w-12 h-12 md:w-14 md:h-14 text-white" fill="currentColor" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-text-dark mb-3">测试完成！</h2>
          <p className="text-text-medium mb-8">
            你答对了 <span className="font-bold text-primary-orange text-2xl md:text-3xl">{correctCount}</span> /{' '}
            {quizQuestions.length} 道题
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-primary-blue/10 to-primary-light-blue/10 rounded-2xl p-4 md:p-5 border border-primary-blue/10">
              <p className="text-3xl md:text-4xl font-bold text-primary-blue">{correctCount}</p>
              <p className="text-sm text-text-medium mt-1">答对</p>
            </div>
            <div className="bg-gradient-to-br from-primary-orange/10 to-primary-light-orange/10 rounded-2xl p-4 md:p-5 border border-primary-orange/10">
              <p className="text-3xl md:text-4xl font-bold text-primary-orange">{unlockedBadgeCount}</p>
              <p className="text-sm text-text-medium mt-1">勋章</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 md:p-5 border border-green-200">
              <p className="text-3xl md:text-4xl font-bold text-green-600">
                {Math.round((correctCount / quizQuestions.length) * 100)}%
              </p>
              <p className="text-sm text-text-medium mt-1">正确率</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <button
              onClick={handleRestart}
              className="flex-1 py-4 bg-gradient-to-r from-primary-blue to-primary-light-blue text-white font-bold text-base rounded-2xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary-blue/20 flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-5 h-5" />
              <span>再测一次</span>
            </button>
            <button
              onClick={() => setShowBadges(true)}
              className="flex-1 py-4 bg-gradient-to-r from-primary-orange to-primary-light-orange text-white font-bold text-base rounded-2xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary-orange/20 flex items-center justify-center gap-2 group"
            >
              <Trophy className="w-5 h-5" fill="currentColor" />
              <span>查看勋章</span>
            </button>
          </div>
        </div>

        <div className="h-20 md:hidden" />

        {showBadges && (
          <BadgeModal badges={badges} onClose={() => setShowBadges(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      <div className="mb-6 md:mb-8">
        <div className="bg-gradient-to-r from-primary-orange/8 via-primary-light-orange/12 to-primary-orange/8 rounded-3xl p-6 md:p-8 border border-primary-orange/10">
          <div className="flex items-start gap-4">
            <div className="hidden md:flex w-14 h-14 bg-gradient-to-br from-primary-orange to-primary-light-orange rounded-2xl items-center justify-center flex-shrink-0 shadow-md">
              <HelpCircle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-orange md:hidden" fill="currentColor" />
                  <span className="text-base md:text-lg font-semibold text-text-dark">
                    第 {currentQuestionIndex + 1} / {quizQuestions.length} 题
                  </span>
                </div>
                <button
                  onClick={() => setShowBadges(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-primary-orange/10 hover:shadow-md transition-all duration-200"
                >
                  <Trophy className="w-4 h-4 md:w-5 md:h-5 text-primary-orange" fill="currentColor" />
                  <span className="text-sm md:text-base font-semibold text-primary-orange">
                    {unlockedBadgeCount}/{badges.length}
                  </span>
                </button>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-primary-orange to-primary-light-orange transition-all duration-500 ease-out rounded-full"
                  style={{
                    width: `${((currentQuestionIndex + (isAnswered ? 1 : 0)) / quizQuestions.length) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm md:text-base text-text-medium mt-3">
                进度：{Math.round(((currentQuestionIndex + (isAnswered ? 1 : 0)) / quizQuestions.length) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="bg-white rounded-3xl p-7 md:p-10 shadow-card border border-border-light max-w-2xl mx-auto">
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-text-dark mb-8 md:mb-10 leading-relaxed">
            {currentQuestion.question}
          </h3>

          <div className="space-y-5 md:space-y-6">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = isAnswered;

              let optionStyle = 'border-border-light bg-border-subtle/50';
              let iconBgStyle = 'bg-gray-200 text-text-medium';
              
              if (showResult) {
                if (isCorrect) {
                  optionStyle = 'border-success bg-success/10';
                  iconBgStyle = 'bg-success text-white';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'border-error bg-error/10';
                  iconBgStyle = 'bg-error text-white';
                }
              } else if (isSelected) {
                optionStyle = 'border-primary-orange bg-primary-orange/10';
                iconBgStyle = 'bg-primary-orange text-white';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                  className={`w-full flex items-center justify-between p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 ${optionStyle} ${
                    !isAnswered 
                      ? 'hover:border-primary-orange/40 hover:bg-primary-orange/5 active:scale-[0.98] cursor-pointer' 
                      : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <span
                      className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-sm md:text-base font-bold transition-all duration-300 ${iconBgStyle}`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span
                      className={`text-left text-sm md:text-base leading-relaxed ${
                        showResult && isCorrect ? 'font-bold text-success' : 'text-text-dark'
                      }`}
                    >
                      {option}
                    </span>
                  </div>
                  {showResult && (
                    <span className="flex-shrink-0 ml-4">
                      {isCorrect ? (
                        <div className="w-8 h-8 md:w-9 md:h-9 bg-success text-white rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
                        </div>
                      ) : isSelected ? (
                        <div className="w-8 h-8 md:w-9 md:h-9 bg-error text-white rounded-full flex items-center justify-center">
                          <X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
                        </div>
                      ) : null}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div
              className={`mt-8 p-5 md:p-6 rounded-2xl animate-fade-in ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? 'bg-gradient-to-r from-success/10 to-green-50 border border-success/20'
                  : 'bg-gradient-to-r from-primary-orange/8 to-primary-light-orange/8 border border-primary-orange/15'
              }`}
            >
              <p className="text-sm md:text-base text-text-dark leading-relaxed">
                <span
                  className={`inline-flex items-center gap-2 font-bold text-base md:text-lg mb-2 ${
                    selectedAnswer === currentQuestion.correctAnswer ? 'text-success' : 'text-primary-orange'
                  }`}
                >
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <Check className="w-5 h-5" strokeWidth={3} />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  {selectedAnswer === currentQuestion.correctAnswer ? '答对了！太棒了！' : '💡 解析：'}
                </span>
                <span className="block">{currentQuestion.explanation}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {isAnswered && (
        <div className="py-5 md:py-6">
          <button
            onClick={handleNextQuestion}
            className="w-full max-w-2xl mx-auto block py-4 md:py-5 bg-gradient-to-r from-primary-blue to-primary-light-blue text-white font-bold text-lg md:text-xl rounded-2xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary-blue/20 flex items-center justify-center gap-2 group"
          >
            <span>{currentQuestionIndex < quizQuestions.length - 1 ? '下一题' : '查看结果'}</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      <div className="h-20 md:hidden" />

      {showBadgeUnlock && (
        <BadgeUnlockModal badge={showBadgeUnlock} onClose={() => setShowBadgeUnlock(null)} />
      )}

      {showBadges && (
        <BadgeModal badges={badges} onClose={() => setShowBadges(false)} />
      )}
    </div>
  );
}

function BadgeUnlockModal({ badge, onClose }: { badge: Badge; onClose: () => void }) {
  const IconComponent = badgeIconMap[badge.icon] || Star;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-scale-in shadow-2xl border border-border-light"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-28 h-28 mx-auto mb-5 bg-gradient-to-br from-primary-orange to-primary-light-orange rounded-full flex items-center justify-center animate-bounce-slow shadow-lg">
          <IconComponent className="w-14 h-14 text-white" fill="currentColor" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-text-dark mb-2">🎉 获得新勋章！</h2>
        <p className="text-xl md:text-2xl font-bold text-primary-orange mb-2">{badge.name}</p>
        <p className="text-text-medium mb-8">{badge.description}</p>
        <button
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-primary-orange to-primary-light-orange text-white font-bold text-base rounded-2xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary-orange/20"
        >
          太棒了！
        </button>
      </div>
    </div>
  );
}

function BadgeModal({ badges, onClose }: { badges: Badge[]; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl animate-scale-in border border-border-light"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-primary-orange to-primary-light-orange p-6 md:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">我的勋章</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
        </div>

        <div className="p-5 md:p-8 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {badges.map((badge) => {
              const IconComponent = badgeIconMap[badge.icon] || Star;
              return (
                <div
                  key={badge.id}
                  className={`p-5 rounded-2xl text-center transition-all duration-300 ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-primary-orange/10 to-primary-light-orange/10 border-2 border-primary-orange/20 shadow-sm hover:shadow-md hover:scale-[1.02]'
                      : 'bg-border-subtle border-2 border-transparent opacity-50'
                  }`}
                >
                  <div
                    className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      badge.unlocked
                        ? 'bg-gradient-to-br from-primary-orange to-primary-light-orange shadow-md'
                        : 'bg-gray-300'
                    }`}
                  >
                    <IconComponent
                      className={`w-7 h-7 ${badge.unlocked ? 'text-white' : 'text-gray-500'}`}
                      fill={badge.unlocked ? 'currentColor' : 'none'}
                    />
                  </div>
                  <p className="font-bold text-sm md:text-base text-text-dark">{badge.name}</p>
                  <p className="text-xs md:text-sm text-text-medium mt-1.5 leading-relaxed">
                    {badge.unlocked ? '✅ 已解锁' : badge.requirement}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
