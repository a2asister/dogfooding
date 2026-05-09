import React from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Star, Sparkles } from 'lucide-react';

const ALL_BADGES = [
  { id: 'first-day', name: '初次专注', description: '完成第一次专注', icon: Star },
  { id: 'three-days', name: '三日挑战', description: '连续专注三天', icon: Sparkles },
  { id: 'week', name: '一周坚持', description: '连续专注七天', icon: Trophy },
  { id: 'fortnight', name: '半月达人', description: '连续专注十四天', icon: Star },
  { id: 'month', name: '月度之星', description: '连续专注三十天', icon: Trophy }
];

const BadgeModal = ({ badges = [], streak = 0, onClose, isDark, badge, isNew }) => {
  const isSingleBadge = !!badge;
  const displayBadges = isSingleBadge ? [badge] : badges;
  const earnedIds = displayBadges.map(b => b.id);

  const badgeList = isSingleBadge 
    ? [badge] 
    : ALL_BADGES.map(def => ({
        ...def,
        earned: earnedIds.includes(def.id)
      }));

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={overlayVariants}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <motion.div
        className={`max-w-md w-full rounded-3xl backdrop-blur-xl p-6 ${
          isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
        }`}
        onClick={(e) => e.stopPropagation()}
        variants={modalVariants}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={isNew ? {
          background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,105,180,0.2) 100%)',
          border: '1px solid rgba(255,215,0,0.3)'
        } : {}}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            {isNew ? (
              <Sparkles className="text-yellow-400" size={24} />
            ) : (
              <Trophy size={24} />
            )}
            <h2 className="text-xl font-bold">
              {isNew ? '🎉 获得新勋章！' : `勋章墙 · 连续 ${streak} 天`}
            </h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className={`p-2 rounded-full ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'
            }`}
          >
            <X size={20} />
          </motion.button>
        </div>

        {isNew ? (
          <div className="flex flex-col items-center py-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="relative"
            >
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ff6b9d 100%)',
                  boxShadow: '0 0 60px rgba(255, 215, 0, 0.5)'
                }}
              >
                <Trophy size={60} className="text-white" />
              </div>
              
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-300"
                  initial={{ 
                    scale: 0, 
                    opacity: 0,
                    x: 0,
                    y: 0
                  }}
                  animate={{ 
                    scale: [0, 1.5, 0], 
                    opacity: [0, 1, 0],
                    x: Math.cos(i * Math.PI / 4) * 80,
                    y: Math.sin(i * Math.PI / 4) * 80
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: 0.3 + i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    marginLeft: -10,
                    marginTop: -10
                  }}
                >
                  <Sparkles size={20} />
                </motion.div>
              ))}
            </motion.div>
            
            <motion.h3 
              className="mt-6 text-2xl font-bold"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {badge.name}
            </motion.h3>
            
            <motion.p 
              className="mt-2 text-sm opacity-70 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              恭喜你！继续保持专注的好习惯
            </motion.p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {badgeList.map((def, index) => {
              const IconComponent = def.icon;
              const isEarned = def.earned || isSingleBadge;
              
              return (
                <motion.div
                  key={def.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-2xl text-center ${
                    isEarned 
                      ? 'bg-gradient-to-br from-yellow-400/30 to-pink-500/30' 
                      : isDark 
                        ? 'bg-white/5' 
                        : 'bg-black/5'
                  }`}
                  style={isEarned ? {
                    border: '1px solid rgba(255,215,0,0.3)'
                  } : {}}
                >
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                    isEarned 
                      ? 'bg-gradient-to-br from-yellow-400 to-pink-500' 
                      : isDark 
                        ? 'bg-white/10' 
                        : 'bg-black/10'
                  }`}>
                    <IconComponent 
                      size={32} 
                      className={isEarned ? 'text-white' : isDark ? 'text-white/30' : 'text-black/30'}
                    />
                  </div>
                  <h4 className={`font-medium ${
                    isEarned ? '' : isDark ? 'text-white/50' : 'text-black/50'
                  }`}>
                    {def.name}
                  </h4>
                  <p className={`text-xs mt-1 ${
                    isEarned 
                      ? isDark ? 'text-white/60' : 'text-black/60'
                      : isDark ? 'text-white/30' : 'text-black/30'
                  }`}>
                    {def.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BadgeModal;
