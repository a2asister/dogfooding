import type { Task } from '../types/eventLoop';

interface TaskListProps {
  title: string;
  tasks: Task[];
  type: 'macro' | 'micro';
}

export function TaskList({ title, tasks, type }: TaskListProps) {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'running': return 'running';
      case 'completed': return 'completed';
      case 'error': return 'error';
      default: return 'pending';
    }
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className={`tasks-container ${type}-tasks`}>
      <h3>{title} ({tasks.length})</h3>
      {tasks.length === 0 ? (
        <div className="empty-state">暂无待执行任务</div>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className={`task-item ${getStatusColor(task.status)}`}
          >
            <div className="task-name">{task.name}</div>
            <div className="task-meta">
              <span className="task-type">{task.type}</span>
              <span className="task-status">状态: {task.status}</span>
              <span>延迟: {task.delay}ms</span>
              {task.startTime && (
                <span>开始: {formatTime(task.startTime)}</span>
              )}
              {task.endTime && (
                <span>结束: {formatTime(task.endTime)}</span>
              )}
            </div>
            {task.error && (
              <div style={{ color: 'var(--error-color)', marginTop: '8px', fontSize: '0.85rem' }}>
                错误: {task.error.message}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
