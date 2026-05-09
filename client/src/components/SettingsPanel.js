import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Coffee, RefreshCw, Volume2, Sun, Moon } from 'lucide-react';

const SettingsPanel = ({ settings, onClose, onUpdate, scenarios }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const isDark = localSettings.theme === 'dark';

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onUpdate(localSettings);
    onClose();
  };

  const modalVariants = {
    hidden: { opacity: 0, x: '100%' },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '100%' }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={overlayVariants}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
    >
      <motion.div
        className={`w-full max-w-md h-full ${
          isDark ? 'bg-gray-900/95 text-white' : 'bg-white/95 text-black'
        } backdrop-blur-xl p-6 overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
        variants={modalVariants}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">设置</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className={`p-2 rounded-full ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'
            }`}
          >
            <X size={24} />
          </motion.button>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={20} />
              <h3 className="text-lg font-semibold">专注时长</h3>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[25, 30, 45, 60].map(min => (
                <motion.button
                  key={min}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChange('customDuration', min)}
                  className={`py-3 rounded-xl font-medium ${
                    localSettings.customDuration === min
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : isDark 
                        ? 'bg-white/10 hover:bg-white/20' 
                        : 'bg-black/10 hover:bg-black/20'
                  }`}
                >
                  {min}
                  <span className="text-xs ml-1">分钟</span>
                </motion.button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="120"
                value={localSettings.customDuration}
                onChange={(e) => handleChange('customDuration', parseInt(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #667eea 0%, #764ba2 ${(localSettings.customDuration - 5) / 1.15}%, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} ${(localSettings.customDuration - 5) / 1.15}%, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 100%)`
                }}
              />
              <span className="text-sm font-medium w-16 text-right">
                {localSettings.customDuration} 分钟
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Coffee size={20} />
              <h3 className="text-lg font-semibold">休息时长</h3>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[5, 10, 15, 20].map(min => (
                <motion.button
                  key={min}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChange('customBreakDuration', min)}
                  className={`py-3 rounded-xl font-medium ${
                    localSettings.customBreakDuration === min
                      ? 'bg-gradient-to-r from-green-400 to-teal-500 text-white'
                      : isDark 
                        ? 'bg-white/10 hover:bg-white/20' 
                        : 'bg-black/10 hover:bg-black/20'
                  }`}
                >
                  {min}
                  <span className="text-xs ml-1">分钟</span>
                </motion.button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="60"
                value={localSettings.customBreakDuration}
                onChange={(e) => handleChange('customBreakDuration', parseInt(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #43e97b 0%, #38f9d7 ${(localSettings.customBreakDuration - 1) / 0.59}%, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} ${(localSettings.customBreakDuration - 1) / 0.59}%, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 100%)`
                }}
              />
              <span className="text-sm font-medium w-16 text-right">
                {localSettings.customBreakDuration} 分钟
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div 
              className={`flex items-center justify-between p-4 rounded-2xl ${
                isDark ? 'bg-white/5' : 'bg-black/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <RefreshCw size={20} />
                <div>
                  <p className="font-medium">循环模式</p>
                  <p className={`text-xs ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                    专注结束后自动进入休息
                  </p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChange('cycleMode', !localSettings.cycleMode)}
                className={`w-12 h-7 rounded-full relative transition-colors ${
                  localSettings.cycleMode 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : isDark ? 'bg-white/20' : 'bg-black/20'
                }`}
              >
                <motion.div
                  animate={{ x: localSettings.cycleMode ? 22 : 2 }}
                  className="w-5 h-5 bg-white rounded-full absolute top-1"
                />
              </motion.button>
            </div>

            <div 
              className={`flex items-center justify-between p-4 rounded-2xl ${
                isDark ? 'bg-white/5' : 'bg-black/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Volume2 size={20} />
                <div>
                  <p className="font-medium">白噪音</p>
                  <p className={`text-xs ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                    专注时播放舒缓背景音
                  </p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChange('whiteNoise', !localSettings.whiteNoise)}
                className={`w-12 h-7 rounded-full relative transition-colors ${
                  localSettings.whiteNoise 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : isDark ? 'bg-white/20' : 'bg-black/20'
                }`}
              >
                <motion.div
                  animate={{ x: localSettings.whiteNoise ? 22 : 2 }}
                  className="w-5 h-5 bg-white rounded-full absolute top-1"
                />
              </motion.button>
            </div>

            <div 
              className={`flex items-center justify-between p-4 rounded-2xl ${
                isDark ? 'bg-white/5' : 'bg-black/5'
              }`}
            >
              <div className="flex items-center gap-3">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                <div>
                  <p className="font-medium">深色模式</p>
                  <p className={`text-xs ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                    切换界面显示模式
                  </p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChange('theme', localSettings.theme === 'dark' ? 'light' : 'dark')}
                className={`w-12 h-7 rounded-full relative transition-colors ${
                  localSettings.theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : isDark ? 'bg-white/20' : 'bg-black/20'
                }`}
              >
                <motion.div
                  animate={{ x: localSettings.theme === 'dark' ? 22 : 2 }}
                  className="w-5 h-5 bg-white rounded-full absolute top-1"
                />
              </motion.button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg shadow-lg"
          >
            保存设置
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPanel;
