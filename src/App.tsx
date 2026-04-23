import { useEffect, useRef, useCallback } from 'react';
import { ThreeDScene } from '@/three/ThreeDScene';
import { DataPanel } from '@/components/DataPanel';
import { ViewControls, ActionControls, HistoryPlaybackControls } from '@/components/ViewControls';
import { HistoryPanel } from '@/components/HistoryPanel';
import { SimulationPanel } from '@/components/SimulationPanel';
import { WarningIndicator, WarningPanel } from '@/components/WarningPanel';
import { InfoPanel } from '@/components/InfoPanel';
import { useAppStore } from '@/stores/appStore';
import { useDataService } from '@/hooks/useDataService';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

function App() {
  const { 
    currentData, 
    mode,
    isPlayingHistory,
    setIsPlayingHistory,
    historicalRecords,
    selectedHistoryId,
    historyPlaybackIndex,
    setHistoryPlaybackIndex,
    setCurrentData,
    lastUpdateTime,
  } = useAppStore();
  
  useDataService();
  
  const playbackIntervalRef = useRef<number | null>(null);
  
  const selectedRecord = historicalRecords.find(r => r.id === selectedHistoryId);
  
  const handlePlayPause = useCallback(() => {
    setIsPlayingHistory(!isPlayingHistory);
  }, [isPlayingHistory, setIsPlayingHistory]);
  
  const handlePrev = useCallback(() => {
    if (!selectedRecord) return;
    setHistoryPlaybackIndex(Math.max(0, historyPlaybackIndex - 1));
  }, [selectedRecord, historyPlaybackIndex, setHistoryPlaybackIndex]);
  
  const handleNext = useCallback(() => {
    if (!selectedRecord) return;
    setHistoryPlaybackIndex(Math.min(selectedRecord.dataPoints.length - 1, historyPlaybackIndex + 1));
  }, [selectedRecord, historyPlaybackIndex, setHistoryPlaybackIndex]);
  
  const handleReset = useCallback(() => {
    setHistoryPlaybackIndex(0);
    setIsPlayingHistory(false);
  }, [setHistoryPlaybackIndex, setIsPlayingHistory]);
  
  useEffect(() => {
    if (!selectedRecord || !selectedRecord.dataPoints || selectedRecord.dataPoints.length === 0) return;
    
    const safeIndex = Math.max(0, Math.min(selectedRecord.dataPoints.length - 1, historyPlaybackIndex));
    const dataPoint = selectedRecord.dataPoints[safeIndex];
    if (dataPoint) {
      setCurrentData(dataPoint);
    }
  }, [historyPlaybackIndex, selectedRecord, setCurrentData]);

  useEffect(() => {
    if (mode !== 'history' || !selectedRecord || !selectedRecord.dataPoints || selectedRecord.dataPoints.length === 0 || !isPlayingHistory) {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
      return;
    }
    
    const totalPoints = selectedRecord.dataPoints.length;
    
    playbackIntervalRef.current = window.setInterval(() => {
      setHistoryPlaybackIndex(prev => {
        const safePrev = typeof prev === 'number' && !isNaN(prev) ? prev : 0;
        const next = safePrev + 1;
        if (next >= totalPoints) {
          setIsPlayingHistory(false);
          return safePrev;
        }
        return next;
      });
    }, 500);
    
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, [mode, selectedRecord, isPlayingHistory, setHistoryPlaybackIndex, setIsPlayingHistory]);
  
  return (
    <div className="w-full h-full relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <ThreeDScene data={currentData} />
      </div>
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="glass-panel px-6 py-2 flex items-center gap-4">
          <h1 className="text-lg font-bold bg-gradient-to-r from-water-light to-water-blue bg-clip-text text-transparent">
            三峡大坝泄洪动态展示
          </h1>
          
          <div className="w-px h-5 bg-white/20" />
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              mode === 'simulation' ? 'bg-warning-amber' : 
              mode === 'history' ? 'bg-nature-green' : 'bg-water-blue'
            } animate-pulse`} />
            <span className="text-xs text-white/70">
              {mode === 'simulation' ? '模拟模式' : mode === 'history' ? '历史回放' : '实时模式'}
            </span>
          </div>
          
          {lastUpdateTime > 0 && (
            <>
              <div className="w-px h-5 bg-white/20" />
              <span className="text-xs text-white/50">
                更新: {format(lastUpdateTime, 'HH:mm:ss', { locale: zhCN })}
              </span>
            </>
          )}
        </div>
      </div>
      
      <ViewControls />
      
      <WarningIndicator />
      <WarningPanel />
      
      <DataPanel />
      
      <HistoryPanel />
      <SimulationPanel />
      
      <InfoPanel />
      
      <ActionControls />
      
      {mode === 'history' && selectedRecord && (
        <HistoryPlaybackControls
          isPlaying={isPlayingHistory}
          onPlayPause={handlePlayPause}
          onPrev={handlePrev}
          onNext={handleNext}
          onReset={handleReset}
          currentIndex={historyPlaybackIndex}
          total={selectedRecord.dataPoints.length}
        />
      )}
      
      <div className="absolute bottom-4 right-4 z-10">
        <div className="glass-panel px-3 py-2 text-xs text-white/50">
          <div className="flex items-center gap-1">
          <span className="text-white/30">鼠标：</span>
          <span>左键拖拽旋转</span>
          <span className="text-white/30">|</span>
          <span>右键平移</span>
          <span className="text-white/30">|</span>
          <span>滚轮缩放</span>
        </div>
        </div>
      </div>
    </div>
  );
}

export default App;
