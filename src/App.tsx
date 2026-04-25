import { useState, useEffect, useCallback } from 'react';
import MeiosisCanvas from './components/MeiosisCanvas';
import ControlPanel from './components/ControlPanel';
import type { MeiosisPhaseId } from './types';
import { loadSettings, saveSettings, validatePhaseId } from './utils/storage';
import './App.css';

function App() {
  const [currentPhaseId, setCurrentPhaseId] = useState<MeiosisPhaseId>('interphase');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useEffect(() => {
    const settings = loadSettings();
    const validatedPhaseId = validatePhaseId(settings.lastViewedPhase);
    
    setPlaybackSpeed(settings.playbackSpeed);
    setShowAnnotations(settings.showAnnotations);
    setCurrentPhaseId(validatedPhaseId);
  }, []);
  
  useEffect(() => {
    saveSettings({
      playbackSpeed,
      showAnnotations,
      lastViewedPhase: currentPhaseId
    });
  }, [playbackSpeed, showAnnotations, currentPhaseId]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const handlePhaseChange = useCallback((phaseId: MeiosisPhaseId) => {
    setCurrentPhaseId(phaseId);
    setPhaseProgress(0);
  }, []);
  
  const handleProgressChange = useCallback((progress: number) => {
    setPhaseProgress(progress);
  }, []);
  
  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);
  
  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);
  
  const handleAnnotationToggle = useCallback(() => {
    setShowAnnotations(prev => !prev);
  }, []);
  
  const handleRestart = useCallback(() => {
    setCurrentPhaseId('interphase');
    setPhaseProgress(0);
    setIsPlaying(true);
  }, []);
  
  const handlePlaybackComplete = useCallback(() => {
    setIsPlaying(false);
    setCurrentPhaseId('telophase2');
    setPhaseProgress(1);
  }, []);
  
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn('Fullscreen request failed:', error);
    }
  }, []);
  
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>减数分裂演示程序</h1>
          <p className="subtitle">
            二倍体两对同源染色体减数分裂完整过程演示
          </p>
          <button
            onClick={toggleFullscreen}
            className="fullscreen-btn"
          >
            {isFullscreen ? '退出全屏' : '全屏播放'}
          </button>
        </div>
      </header>
      
      <main className="main-content">
        <div className="canvas-container">
          <MeiosisCanvas
            currentPhaseId={currentPhaseId}
            phaseProgress={phaseProgress}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            showAnnotations={showAnnotations}
            onPhaseChange={handlePhaseChange}
            onProgressChange={handleProgressChange}
            onPlaybackComplete={handlePlaybackComplete}
          />
        </div>
        
        <ControlPanel
          isPlaying={isPlaying}
          currentPhaseId={currentPhaseId}
          phaseProgress={phaseProgress}
          playbackSpeed={playbackSpeed}
          showAnnotations={showAnnotations}
          onPlayPause={handlePlayPause}
          onPhaseChange={handlePhaseChange}
          onSpeedChange={handleSpeedChange}
          onAnnotationToggle={handleAnnotationToggle}
          onRestart={handleRestart}
        />
      </main>
      
      <footer className="app-footer">
        <div className="legend">
          <h3>图例说明</h3>
          <div className="legend-items">
            <div className="legend-item">
              <span 
                className="legend-color" 
                style={{ backgroundColor: '#E53935' }}
              />
              <span>母方染色体</span>
            </div>
            <div className="legend-item">
              <span 
                className="legend-color" 
                style={{ backgroundColor: '#1E88E5' }}
              />
              <span>父方染色体</span>
            </div>
            <div className="legend-item">
              <span 
                className="legend-color" 
                style={{ backgroundColor: '#FDD835' }}
              />
              <span>着丝点</span>
            </div>
            <div className="legend-item">
              <span 
                className="legend-color" 
                style={{ backgroundColor: '#9C27B0' }}
              />
              <span>交叉互换区段</span>
            </div>
          </div>
        </div>
        
        <div className="instructions">
          <h3>操作说明</h3>
          <ul>
            <li>点击「播放/暂停」按钮控制动画播放</li>
            <li>点击阶段按钮可快速跳转到指定阶段</li>
            <li>选择「慢速/正常/快速」调节播放速度</li>
            <li>点击「学术标注」按钮显示/隐藏详细标注</li>
            <li>按空格键快速暂停/继续播放</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default App;
