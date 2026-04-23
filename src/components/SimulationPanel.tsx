import { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/appStore';
import { 
  Play, 
  RotateCcw, 
  Save, 
  Settings, 
  Plus, 
  Minus, 
  X,
  Droplets,
  AlertTriangle
} from 'lucide-react';
import { DAM_DEFAULT_PARAMS } from '@/stores/appStore';

const MAX_HOLES = 77;
const MAX_FLOW = 124300;
const STEP_FLOW = 1000;

export function SimulationPanel() {
  const { 
    mode, 
    simulationParams, 
    setSimulationParams,
    setMode,
  } = useAppStore();
  
  const [holeStart, setHoleStart] = useState(1);
  const [holeEnd, setHoleEnd] = useState(5);
  
  const flowPercentage = useMemo(() => {
    return (simulationParams.customDischargeFlow / MAX_FLOW) * 100;
  }, [simulationParams.customDischargeFlow]);
  
  const handleToggleSimulation = () => {
    if (!simulationParams.enabled) {
      setSimulationParams({
        enabled: true,
        customOpenHoles: Array.from({ length: 5 }, (_, i) => i + 1),
        customDischargeFlow: 20000,
      });
    } else {
      setSimulationParams({
        enabled: false,
        customOpenHoles: [],
        customDischargeFlow: 0,
      });
      setMode('real-time');
    }
  };
  
  const handleAddHoleRange = () => {
    const start = Math.min(Math.max(holeStart, 1), MAX_HOLES);
    const end = Math.min(Math.max(holeEnd, start), MAX_HOLES);
    
    const newHoles = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const mergedHoles = [...new Set([...simulationParams.customOpenHoles, ...newHoles])].sort((a, b) => a - b);
    
    setSimulationParams({ customOpenHoles: mergedHoles });
  };
  
  const handleRemoveHole = (hole: number) => {
    setSimulationParams({
      customOpenHoles: simulationParams.customOpenHoles.filter(h => h !== hole),
    });
  };
  
  const handleClearAll = () => {
    setSimulationParams({
      customOpenHoles: [],
      customDischargeFlow: 0,
    });
  };
  
  const handleAdjustFlow = (delta: number) => {
    const newFlow = Math.max(0, Math.min(MAX_FLOW, simulationParams.customDischargeFlow + delta));
    setSimulationParams({ customDischargeFlow: newFlow });
  };
  
  const handleSetFlow = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setSimulationParams({ 
        customDischargeFlow: Math.max(0, Math.min(MAX_FLOW, numValue)) 
      });
    }
  };
  
  const estimatedHolesNeeded = Math.ceil(simulationParams.customDischargeFlow / 8000);
  
  if (mode !== 'simulation') {
    return null;
  }
  
  return (
    <div className="fixed right-4 top-20 z-40 glass-panel w-80 max-h-[calc(100vh-200px)] flex flex-col">
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-water-light" />
            <h3 className="font-semibold">模拟控制</h3>
          </div>
          <button
            onClick={handleToggleSimulation}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              simulationParams.enabled
                ? 'bg-danger-red text-white'
                : 'bg-water-blue text-white'
            }`}
          >
            {simulationParams.enabled ? '退出模拟' : '开始模拟'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-water-light" />
              <span className="text-sm font-medium">泄洪流量</span>
            </div>
            <span className="text-xs text-white/50">
              建议: {estimatedHolesNeeded} 孔
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAdjustFlow(-STEP_FLOW * 5)}
              className="control-btn-secondary p-2"
              disabled={!simulationParams.enabled}
            >
              <Minus className="w-3 h-3" />
            </button>
            
            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={MAX_FLOW}
                step={STEP_FLOW}
                value={simulationParams.customDischargeFlow}
                onChange={(e) => handleSetFlow(e.target.value)}
                disabled={!simulationParams.enabled}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                style={{
                  background: `linear-gradient(to right, #1e88e5 ${flowPercentage}%, rgba(255,255,255,0.2) ${flowPercentage}%)`
                }}
              />
            </div>
            
            <button
              onClick={() => handleAdjustFlow(STEP_FLOW * 5)}
              className="control-btn-secondary p-2"
              disabled={!simulationParams.enabled}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">0</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={simulationParams.customDischargeFlow}
                onChange={(e) => handleSetFlow(e.target.value)}
                disabled={!simulationParams.enabled}
                className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1 text-center text-sm focus:outline-none focus:border-water-blue/50 disabled:opacity-50"
              />
              <span className="text-white/60">m³/s</span>
            </div>
            <span className="text-white/50">{MAX_FLOW.toLocaleString()}</span>
          </div>
          
          {simulationParams.customDischargeFlow > DAM_DEFAULT_PARAMS.designDischargeCapacity && (
            <div className="flex items-center gap-2 p-2 bg-danger-red/20 rounded-lg text-xs">
              <AlertTriangle className="w-4 h-4 text-danger-red" />
              <span className="text-danger-red">流量超过设计容量</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">开启泄洪孔</span>
            <button
              onClick={handleClearAll}
              className="text-xs text-white/50 hover:text-white transition-colors"
              disabled={!simulationParams.enabled}
            >
              清空
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="起始孔"
              value={holeStart}
              onChange={(e) => setHoleStart(parseInt(e.target.value) || 1)}
              min={1}
              max={MAX_HOLES}
              disabled={!simulationParams.enabled}
              className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-center text-sm focus:outline-none focus:border-water-blue/50 disabled:opacity-50"
            />
            <span className="text-white/40">-</span>
            <input
              type="number"
              placeholder="结束孔"
              value={holeEnd}
              onChange={(e) => setHoleEnd(parseInt(e.target.value) || 1)}
              min={1}
              max={MAX_HOLES}
              disabled={!simulationParams.enabled}
              className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-center text-sm focus:outline-none focus:border-water-blue/50 disabled:opacity-50"
            />
            <button
              onClick={handleAddHoleRange}
              className="control-btn-primary px-3 py-1.5 text-xs"
              disabled={!simulationParams.enabled}
            >
              添加
            </button>
          </div>
          
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 bg-white/5 rounded-lg">
            {simulationParams.customOpenHoles.length === 0 ? (
              <span className="text-xs text-white/40 w-full text-center py-2">
                未开启泄洪孔
              </span>
            ) : (
              simulationParams.customOpenHoles.map((hole) => (
                <button
                  key={hole}
                  onClick={() => handleRemoveHole(hole)}
                  className="flex items-center gap-1 px-2 py-0.5 bg-water-blue/30 hover:bg-water-blue/40 rounded text-xs transition-colors"
                  disabled={!simulationParams.enabled}
                >
                  {hole}
                  <X className="w-3 h-3" />
                </button>
              ))
            )}
          </div>
          
          <div className="text-xs text-white/50">
            已开启 {simulationParams.customOpenHoles.length} 个泄洪孔
          </div>
        </div>
      </div>
      
      <div className="p-3 border-t border-white/10 space-y-2">
        <button
          className="w-full control-btn-primary justify-center"
          disabled={!simulationParams.enabled || simulationParams.customOpenHoles.length === 0}
        >
          <Play className="w-4 h-4" />
          运行模拟
        </button>
        
        <div className="flex gap-2">
          <button className="flex-1 control-btn-secondary justify-center text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            重置
          </button>
          <button className="flex-1 control-btn-secondary justify-center text-xs">
            <Save className="w-3.5 h-3.5" />
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
