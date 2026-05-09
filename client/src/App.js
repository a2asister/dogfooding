import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import TimerRing from './components/TimerRing';
import StatsChart from './components/StatsChart';
import BadgeModal from './components/BadgeModal';
import SettingsPanel from './components/SettingsPanel';
import ScenarioSelector from './components/ScenarioSelector';
import WhiteNoisePlayer from './components/WhiteNoisePlayer';
import { Play, Pause, RotateCcw, Sun, Moon, Volume2, VolumeX, Trophy, Settings } from 'lucide-react';

const SCENARIOS = [
  { id: 'study', name: '学习', color: '#667eea', secondaryColor: '#764ba2', duration: 45 },
  { id: 'work', name: '工作', color: '#f093fb', secondaryColor: '#f5576c', duration: 50 },
  { id: 'reading', name: '阅读', color: '#4facfe', secondaryColor: '#00f2fe', duration: 30 },
  { id: 'break', name: '休息', color: '#43e97b', secondaryColor: '#38f9d7', duration: 15 }
];

function App() {
  const [settings, setSettings] = useState({
    currentScenario: 'study',
    theme: 'dark',
    whiteNoise: true,
    cycleMode: true,
    customDuration: 45,
    customBreakDuration: 15
  });
  
  const [timeLeft, setTimeLeft] = useState(2700);
  const [totalTime, setTotalTime] = useState(2700);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [badges, setBadges] = useState([]);
  const [streak, setStreak] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [newBadge, setNewBadge] = useState(null);
  const [statsView, setStatsView] = useState('week');
  const [statsData, setStatsData] = useState([]);
  const [pressTimer, setPressTimer] = useState(null);
  
  const intervalRef = useRef(null);
  const longPressTimer = useRef(null);

  const currentScenario = SCENARIOS.find(s => s.id === settings.currentScenario) || SCENARIOS[0];
  const isDark = settings.theme === 'dark';

  useEffect(() => {
    if (!isRunning) {
      const duration = isBreak 
        ? settings.customBreakDuration * 60 
        : settings.customDuration * 60;
      setTimeLeft(duration);
      setTotalTime(duration);
    }
  }, [settings.customDuration, settings.customBreakDuration, isBreak, isRunning]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [statsView]);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/data');
      setBadges(response.data.badges || []);
      setStreak(response.data.streak || 0);
      if (response.data.settings) {
        setSettings(prev => ({ ...prev, ...response.data.settings }));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const endpoint = statsView === 'week' ? '/api/stats/week' : '/api/stats/month';
      const response = await axios.get(endpoint);
      setStatsData(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    if (!isBreak) {
      try {
        const response = await axios.post('/api/session', {
          duration: settings.customDuration,
          scenario: settings.currentScenario
        });
        
        setStreak(response.data.streak);
        
        const oldBadgeCount = badges.length;
        const newBadgeCount = response.data.badges.length;
        
        if (newBadgeCount > oldBadgeCount) {
          const latestBadge = response.data.badges[newBadgeCount - 1];
          setNewBadge(latestBadge);
          setBadges(response.data.badges);
        }
      } catch (error) {
        console.error('Failed to save session:', error);
      }
    }

    if (settings.cycleMode) {
      if (isBreak) {
        setIsBreak(false);
        setTimeLeft(settings.customDuration * 60);
        setTotalTime(settings.customDuration * 60);
      } else {
        setIsBreak(true);
        setTimeLeft(settings.customBreakDuration * 60);
        setTotalTime(settings.customBreakDuration * 60);
      }
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    const duration = settings.customDuration * 60;
    setTimeLeft(duration);
    setTotalTime(duration);
  };

  const handlePressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowSettings(true);
    }, 800);
  };

  const handlePressEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleMouseDown = () => {
    handlePressStart();
  };

  const handleMouseUp = () => {
    handlePressEnd();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  const toggleWhiteNoise = () => {
    updateSettings({ whiteNoise: !settings.whiteNoise });
  };

  const updateSettings = async (newSettings) => {
    try {
      setSettings(prev => ({ ...prev, ...newSettings }));
      await axios.put('/api/settings', newSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const switchScenario = (scenarioId) => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (scenario) {
      updateSettings({ currentScenario: scenarioId, customDuration: scenario.duration });
      setIsRunning(false);
      setIsBreak(false);
    }
  };

  const backgroundStyle = {
    background: `linear-gradient(135deg, ${currentScenario.color} 0%, ${currentScenario.secondaryColor} 100%)`,
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden cursor-pointer"
      style={backgroundStyle}
      onClick={toggleTimer}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
    >
      <div 
        className="absolute inset-0 backdrop-blur-3xl opacity-50"
        style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)' }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-between p-8">
        <div className="w-full flex justify-between items-center z-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); setShowBadges(true); }}
            className={`p-3 rounded-full backdrop-blur-md flex items-center gap-2 ${
              isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
            }`}
          >
            <Trophy size={20} />
            <span className="text-sm font-medium">{streak}</span>
          </motion.button>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); toggleWhiteNoise(); }}
              className={`p-3 rounded-full backdrop-blur-md ${
                isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
              }`}
            >
              {settings.whiteNoise ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
              className={`p-3 rounded-full backdrop-blur-md ${
                isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
              className={`p-3 rounded-full backdrop-blur-md ${
                isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
              }`}
            >
              <Settings size={20} />
            </motion.button>
          </div>
        </div>

        <ScenarioSelector 
          scenarios={SCENARIOS}
          currentScenario={settings.currentScenario}
          onSelect={switchScenario}
          isDark={isDark}
        />

        <div className="flex flex-col items-center gap-8 z-10">
          <TimerRing 
            progress={1 - timeLeft / totalTime}
            size={280}
            strokeWidth={12}
            color={currentScenario.color}
            secondaryColor={currentScenario.secondaryColor}
            isDark={isDark}
          >
            <div className="flex flex-col items-center">
              <motion.span 
                className="text-6xl font-light tracking-wider"
                style={{ color: isDark ? 'white' : '#1a1a1a' }}
                key={timeLeft}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.3 }}
              >
                {formatTime(timeLeft)}
              </motion.span>
              <span 
                className="mt-2 text-lg tracking-widest"
                style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
              >
                {isBreak ? '休息中' : currentScenario.name}
              </span>
            </div>
          </TimerRing>

          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
              className={`p-4 rounded-full backdrop-blur-md ${
                isDark ? 'bg-white/20 text-white' : 'bg-black/20 text-white'
              }`}
              style={{ backgroundColor: `${currentScenario.color}40` }}
            >
              {isRunning ? <Pause size={24} /> : <Play size={24} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); resetTimer(); }}
              className={`p-4 rounded-full backdrop-blur-md ${
                isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
              }`}
            >
              <RotateCcw size={24} />
            </motion.button>
          </div>
        </div>

        <div className="w-full max-w-2xl z-10">
          <StatsChart 
            data={statsData}
            color={currentScenario.color}
            secondaryColor={currentScenario.secondaryColor}
            view={statsView}
            onViewChange={setStatsView}
            isDark={isDark}
          />
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <SettingsPanel 
            settings={settings}
            onClose={() => setShowSettings(false)}
            onUpdate={updateSettings}
            isDark={isDark}
            scenarios={SCENARIOS}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBadges && (
          <BadgeModal 
            badges={badges}
            streak={streak}
            onClose={() => setShowBadges(false)}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newBadge && (
          <BadgeModal 
            badge={newBadge}
            isNew
            onClose={() => setNewBadge(null)}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {settings.whiteNoise && (
        <WhiteNoisePlayer isPlaying={isRunning} />
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs ${
          isDark ? 'text-white/40' : 'text-black/40'
        }`}
      >
        点击空白处启停 · 长按或点击设置按钮打开设置
      </motion.div>
    </div>
  );
}

export default App;
