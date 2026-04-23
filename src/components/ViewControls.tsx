import { useAppStore } from '@/stores/appStore';
import { CAMERA_VIEWS } from '@/three/controls/CameraView';
import { Eye, RotateCcw, Camera, RotateCw, Maximize2, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

const VIEW_PRESETS: { type: keyof typeof CAMERA_VIEWS; label: string }[] = [
  { type: 'front', label: '正面' },
  { type: 'side', label: '侧面' },
  { type: 'top', label: '俯视' },
];

export function ViewControls() {
  const { cameraView, setCameraView } = useAppStore();
  
  return (
    <div className="fixed right-4 top-4 z-40 glass-panel p-2">
      <div className="flex items-center gap-1">
        <Eye className="w-4 h-4 text-white/60 mr-1" />
        {VIEW_PRESETS.map((view) => (
          <button
            key={view.type}
            onClick={() => setCameraView(view.type)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              cameraView === view.type
                ? 'bg-water-blue text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ActionControls() {
  const { mode, setMode, toggleInfoPanel, simulationParams, setSimulationParams } = useAppStore();
  
  const handleModeChange = (newMode: 'real-time' | 'history' | 'simulation') => {
    if (newMode === 'simulation' && !simulationParams.enabled) {
      setSimulationParams({
        enabled: true,
        customOpenHoles: [1, 2, 3, 4, 5],
        customDischargeFlow: 20000,
      });
    }
    if (newMode === 'real-time' && simulationParams.enabled) {
      setSimulationParams({
        enabled: false,
        customOpenHoles: [],
        customDischargeFlow: 0,
      });
    }
    setMode(newMode);
  };
  
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 glass-panel p-2">
      <div className="flex items-center gap-2">
        <ModeButton
          mode="real-time"
          currentMode={mode}
          onClick={() => handleModeChange('real-time')}
          label="实时"
        />
        <div className="w-px h-6 bg-white/20" />
        <ModeButton
          mode="history"
          currentMode={mode}
          onClick={() => handleModeChange('history')}
          label="历史"
        />
        <div className="w-px h-6 bg-white/20" />
        <ModeButton
          mode="simulation"
          currentMode={mode}
          onClick={() => handleModeChange('simulation')}
          label="模拟"
        />
        <div className="w-px h-6 bg-white/20" />
        <button
          onClick={toggleInfoPanel}
          className="control-btn-secondary text-xs"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          信息
        </button>
        <div className="w-px h-6 bg-white/20" />
        <button className="control-btn-secondary text-xs">
          <Camera className="w-3.5 h-3.5" />
          截图
        </button>
      </div>
    </div>
  );
}

function ModeButton({ 
  mode, 
  currentMode, 
  onClick, 
  label 
}: { 
  mode: string; 
  currentMode: string; 
  onClick: () => void; 
  label: string;
}) {
  const isActive = currentMode === mode;
  
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
        isActive
          ? 'bg-water-blue text-white shadow-lg shadow-water-blue/30'
          : 'bg-transparent text-white/60 hover:text-white hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );
}

interface HistoryPlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  currentIndex: number;
  total: number;
}

export function HistoryPlaybackControls({
  isPlaying,
  onPlayPause,
  onPrev,
  onNext,
  onReset,
  currentIndex,
  total,
}: HistoryPlaybackControlsProps) {
  const { setHistoryPlaybackIndex } = useAppStore();
  
  const safeTotal = typeof total === 'number' && !isNaN(total) ? Math.max(1, total) : 1;
  const safeCurrentIndex = typeof currentIndex === 'number' && !isNaN(currentIndex) ? currentIndex : 0;
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      const clampedValue = Math.max(0, Math.min(safeTotal - 1, value));
      setHistoryPlaybackIndex(clampedValue);
    }
  };
  
  const safeIndex = Math.max(0, Math.min(safeTotal - 1, safeCurrentIndex));
  const percentage = safeTotal > 1 ? (safeIndex / (safeTotal - 1)) * 100 : 0;
  
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 glass-panel p-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onReset}
          className="control-btn-secondary p-2"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        
        <button
          onClick={onPrev}
          className="control-btn-secondary p-2"
          disabled={safeIndex <= 0}
        >
          <SkipBack className="w-4 h-4" />
        </button>
        
        <button
          onClick={onPlayPause}
          className="control-btn-primary p-3 rounded-full"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        
        <button
          onClick={onNext}
          className="control-btn-secondary p-2"
          disabled={safeIndex >= safeTotal - 1}
        >
          <SkipForward className="w-4 h-4" />
        </button>
        
        <button className="control-btn-secondary p-2">
          <RotateCw className="w-4 h-4" />
        </button>
        
        <div className="text-xs text-white/70 ml-2">
          {safeIndex + 1} / {safeTotal}
        </div>
      </div>
      
      <div className="mt-2">
        <input
          type="range"
          min={0}
          max={Math.max(0, safeTotal - 1)}
          value={safeIndex}
          onChange={handleSliderChange}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #1e88e5 ${percentage}%, rgba(255,255,255,0.2) ${percentage}%)`
          }}
        />
      </div>
    </div>
  );
}
