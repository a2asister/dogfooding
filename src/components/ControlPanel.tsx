import { useState } from 'react';
import type { EventLoopState, LoopConfig, PresetScenario } from '../types/eventLoop';

interface ControlPanelProps {
  state: EventLoopState;
  config: LoopConfig;
  presets: PresetScenario[];
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStep: () => void;
  onStop: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onConfigChange: (config: Partial<LoopConfig>) => void;
  onLoadPreset: (preset: PresetScenario) => void;
  onSaveCheckpoint: (name: string) => void;
  onRestoreCheckpoint: (name: string) => void;
  checkpoints: string[];
}

export function ControlPanel({
  state,
  config,
  presets,
  onStart,
  onPause,
  onResume,
  onStep,
  onStop,
  onReset,
  onSpeedChange,
  onConfigChange,
  onLoadPreset,
  onSaveCheckpoint,
  onRestoreCheckpoint,
  checkpoints,
}: ControlPanelProps) {
  const [checkpointName, setCheckpointName] = useState('');

  const getStatusText = () => {
    if (!state.isRunning) return '空闲';
    if (state.isPaused) return '已暂停';
    return '运行中';
  };

  const getStatusClass = () => {
    if (!state.isRunning) return 'idle';
    if (state.isPaused) return 'paused';
    return 'running';
  };

  return (
    <div className="controls-section">
      <div className="controls-header">
        <h2>控制面板</h2>
        <div className="status-indicator">
          <span className={`status-dot ${getStatusClass()}`}></span>
          <span>{getStatusText()}</span>
        </div>
      </div>

      <div className="control-buttons">
        <button
          className="btn btn-primary"
          onClick={onStart}
          disabled={state.isRunning && !state.isPaused}
        >
          ▶ 开始
        </button>
        <button
          className="btn btn-warning"
          onClick={onPause}
          disabled={!state.isRunning || state.isPaused}
        >
          ⏸ 暂停
        </button>
        <button
          className="btn btn-primary"
          onClick={onResume}
          disabled={!state.isPaused}
        >
          ▶ 继续
        </button>
        <button
          className="btn btn-secondary"
          onClick={onStep}
          disabled={state.isRunning && !state.isPaused}
        >
          ⏭ 单步
        </button>
        <button
          className="btn btn-danger"
          onClick={onStop}
          disabled={!state.isRunning}
        >
          ⏹ 停止
        </button>
        <button
          className="btn btn-secondary"
          onClick={onReset}
        >
          ↺ 重置
        </button>
      </div>

      <div className="speed-control">
        <label>运行速度: {config.speed.toFixed(1)}x</label>
        <input
          type="range"
          className="speed-slider"
          min="0.1"
          max="5"
          step="0.1"
          value={config.speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        />
        <div className="speed-value">
          当前速度: {config.speed.toFixed(1)}x | 迭代计数: {state.tickCount}
        </div>
      </div>

      <div className="config-panel">
        <h3>循环配置</h3>
        <div className="config-item">
          <label>循环时长 (ms)</label>
          <input
            type="number"
            value={config.loopDuration}
            onChange={(e) => onConfigChange({ loopDuration: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="config-item">
          <label>异步延迟 (ms)</label>
          <input
            type="number"
            value={config.asyncDelay}
            onChange={(e) => onConfigChange({ asyncDelay: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="presets-panel">
        <h3>预设场景</h3>
        <div className="presets-list">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="preset-item"
              onClick={() => onLoadPreset(preset)}
            >
              <div className="preset-name">{preset.name}</div>
              <div className="preset-description">{preset.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="checkpoint-section">
        <h3>检查点</h3>
        <div className="checkpoint-form">
          <input
            type="text"
            placeholder="输入检查点名称..."
            value={checkpointName}
            onChange={(e) => setCheckpointName(e.target.value)}
          />
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (checkpointName.trim()) {
                onSaveCheckpoint(checkpointName.trim());
                setCheckpointName('');
              }
            }}
          >
            保存
          </button>
        </div>
        {checkpoints.length > 0 ? (
          <div className="checkpoints-list">
            {checkpoints.map((name) => (
              <div key={name} className="checkpoint-item">
                <span className="checkpoint-name">{name}</span>
                <div className="checkpoint-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => onRestoreCheckpoint(name)}
                  >
                    恢复
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '15px' }}>暂无检查点</div>
        )}
      </div>
    </div>
  );
}
