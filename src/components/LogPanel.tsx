import type { LogEntry } from '../types/eventLoop';

interface LogPanelProps {
  logs: LogEntry[];
  maxLogs?: number;
}

export function LogPanel({ logs, maxLogs = 100 }: LogPanelProps) {
  const displayLogs = logs.slice(-maxLogs);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>运行日志</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
          共 {logs.length} 条记录
        </span>
      </div>
      <div className="logs-panel">
        {displayLogs.length === 0 ? (
          <div className="empty-state" style={{ color: 'rgba(255,255,255,0.5)' }}>
            暂无日志记录
          </div>
        ) : (
          displayLogs.map((log) => (
            <div key={log.id} className="log-entry">
              <span className="log-timestamp">[{formatTime(log.timestamp)}]</span>
              <span className={`log-type ${log.type}`}>
                [{log.type.toUpperCase()}]
              </span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
