interface StatsPanelProps {
  stats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    averageExecutionTime: number;
    totalExecutionTime: number;
  };
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h2>性能统计</h2>
      </div>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{stats.totalTasks}</div>
          <div className="stat-label">总任务数</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.completedTasks}</div>
          <div className="stat-label">已完成</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.pendingTasks}</div>
          <div className="stat-label">待执行</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.averageExecutionTime.toFixed(1)}ms</div>
          <div className="stat-label">平均耗时</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.totalExecutionTime}ms</div>
          <div className="stat-label">总耗时</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {stats.totalTasks > 0 
              ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(1) 
              : 0}%
          </div>
          <div className="stat-label">完成率</div>
        </div>
      </div>
    </div>
  );
}
