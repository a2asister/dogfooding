import { useState, useMemo } from 'react';
import { useEventLoop } from './hooks/useEventLoop';
import { PhaseVisualizer } from './components/PhaseVisualizer';
import { TaskList } from './components/TaskList';
import { ControlPanel } from './components/ControlPanel';
import { LogPanel } from './components/LogPanel';
import { StatsPanel } from './components/StatsPanel';
import { AddTaskForm } from './components/AddTaskForm';
import { ExportPanel } from './components/ExportPanel';
import { EVENT_LOOP_PHASES } from './types/eventLoop';
import type { LoopConfig } from './types/eventLoop';
import './styles/main.css';

const initialConfig: LoopConfig = {
  loopDuration: 1000,
  taskTypeCount: 4,
  asyncDelay: 100,
  speed: 1,
};

function App() {
  const {
    state,
    addMacroTask,
    addMicroTask,
    start,
    pause,
    resume,
    step,
    stop,
    reset,
    setConfig,
    loadScenario,
    saveCheckpoint,
    restoreCheckpoint,
    getCheckpoints,
    getPerformanceStats,
    presets,
  } = useEventLoop(initialConfig);

  const [config, setLocalConfig] = useState<LoopConfig>(initialConfig);
  const checkpoints = useMemo(() => getCheckpoints(), [state.tickCount]);
  const stats = useMemo(() => getPerformanceStats(), [state]);

  const handleSpeedChange = (speed: number) => {
    setLocalConfig(prev => ({ ...prev, speed }));
    setConfig({ speed });
  };

  const handleConfigChange = (newConfig: Partial<LoopConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...newConfig }));
    setConfig(newConfig);
  };

  const handleLoadPreset = (preset: typeof presets[0]) => {
    setLocalConfig(preset.config);
    loadScenario(preset);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Node.js 事件循环可视化模拟器</h1>
        <p>实时可视化展示事件循环机制、微任务/宏任务执行顺序，助力技术教学与演示</p>
      </header>

      <div className="main-grid">
        <div className="main-content">
          <div className="card">
            <div className="card-header">
              <h2>事件循环阶段</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                当前阶段: {state.currentPhase || '空闲'}
              </span>
            </div>
            <PhaseVisualizer
              phases={EVENT_LOOP_PHASES}
              currentPhase={state.currentPhase}
            />
          </div>

          <div className="tasks-section">
            <TaskList
              title="宏任务队列 (Macro Tasks)"
              tasks={state.macroTasks}
              type="macro"
            />
            <TaskList
              title="微任务队列 (Micro Tasks)"
              tasks={state.microTasks}
              type="micro"
            />
          </div>

          {state.completedTasks.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2>已完成任务</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  共 {state.completedTasks.length} 个
                </span>
              </div>
              <TaskList
                title="已完成"
                tasks={state.completedTasks.slice().reverse()}
                type="macro"
              />
            </div>
          )}

          <AddTaskForm
            onAddMacroTask={addMacroTask}
            onAddMicroTask={addMicroTask}
          />

          <LogPanel logs={state.logs} />
        </div>

        <div className="sidebar">
          <ControlPanel
            state={state}
            config={config}
            presets={presets}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onStep={step}
            onStop={stop}
            onReset={reset}
            onSpeedChange={handleSpeedChange}
            onConfigChange={handleConfigChange}
            onLoadPreset={handleLoadPreset}
            onSaveCheckpoint={saveCheckpoint}
            onRestoreCheckpoint={restoreCheckpoint}
            checkpoints={checkpoints}
          />

          <StatsPanel stats={stats} />

          <ExportPanel state={state} />
        </div>
      </div>
    </div>
  );
}

export default App;
