import type { EventLoopPhase, TaskType } from '../types/eventLoop';

interface PhaseVisualizerProps {
  phases: EventLoopPhase[];
  currentPhase: TaskType | null;
}

export function PhaseVisualizer({ phases, currentPhase }: PhaseVisualizerProps) {
  return (
    <div className="phase-visualizer">
      <div className="phases-container">
        {phases.map((phase) => (
          <div
            key={phase.name}
            className={`phase-card ${currentPhase === phase.name ? 'active' : ''}`}
          >
            <div className="phase-name">{phase.name}</div>
            <div className="phase-order">阶段 {phase.order}</div>
            <div className="phase-description">{phase.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
