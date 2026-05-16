import React, { useState, useEffect } from 'react';
import { Process } from '../types';

interface TaskManagerProps {
  processes: Process[];
  onCloseProcess: (processId: string) => void;
  onClose: () => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ processes, onCloseProcess, onClose }) => {
  const [localProcesses, setLocalProcesses] = useState<Process[]>(processes);
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'memory' | 'cpu'>('memory');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const interval = setInterval(() => {
      setLocalProcesses(prev => prev.map(p => ({
        ...p,
        memoryUsage: Math.max(10, p.memoryUsage + (Math.random() - 0.5) * 50),
        cpuUsage: Math.max(0, Math.min(100, p.cpuUsage + (Math.random() - 0.5) * 10)),
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const sortedProcesses = [...localProcesses].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'memory':
        comparison = a.memoryUsage - b.memoryUsage;
        break;
      case 'cpu':
        comparison = a.cpuUsage - b.cpuUsage;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: 'name' | 'memory' | 'cpu') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const totalMemory = sortedProcesses.reduce((sum, p) => sum + p.memoryUsage, 0);
  const totalCpu = sortedProcesses.reduce((sum, p) => sum + p.cpuUsage, 0) / sortedProcesses.length;

  const handleEndTask = (processId: string) => {
    setLocalProcesses(prev => prev.filter(p => p.id !== processId));
    onCloseProcess(processId);
  };

  const getProcessIcon = (type: string) => {
    const icons: Record<string, string> = {
      'image-viewer': '🖼️',
      'video-player': '🎬',
      'document-reader': '📄',
      'web-app': '🌐',
      'browser': '🌐',
      'explorer': '📁',
      'settings': '⚙️',
      'calculator': '🧮',
      'notepad': '📝',
      'task-manager': '📊',
      'app-store': '🏪',
    };
    return icons[type] || '📦';
  };

  return (
    <div
      className="task-manager"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#f5f5f5',
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          background: '#fff',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#333' }}>
            📊 任务管理器
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              border: 'none',
              borderRadius: '4px',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = '#e74c3c';
              (e.target as HTMLElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = 'transparent';
              (e.target as HTMLElement).style.color = '#333';
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              padding: '16px',
              color: '#fff',
            }}
          >
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>进程数量</div>
            <div style={{ fontSize: '28px', fontWeight: 600 }}>{sortedProcesses.length}</div>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '8px',
              padding: '16px',
              color: '#fff',
            }}
          >
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>内存使用</div>
            <div style={{ fontSize: '28px', fontWeight: 600 }}>
              {(totalMemory / 1024).toFixed(1)} GB
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {((totalMemory / 16384) * 100).toFixed(1)}% of 16 GB
            </div>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '8px',
              padding: '16px',
              color: '#fff',
            }}
          >
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>CPU 使用率</div>
            <div style={{ fontSize: '28px', fontWeight: 600 }}>{totalCpu.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '8px 20px', background: '#fff', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => selectedProcess && handleEndTask(selectedProcess)}
            disabled={!selectedProcess}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              background: selectedProcess ? '#e74c3c' : '#e0e0e0',
              color: selectedProcess ? '#fff' : '#999',
              fontSize: '13px',
              cursor: selectedProcess ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
          >
            🗑️ 结束任务
          </button>
          <button
            style={{
              padding: '8px 16px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              background: '#fff',
              color: '#333',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            ➕ 运行新任务
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa', position: 'sticky', top: 0 }}>
              <th
                onClick={() => handleSort('name')}
                style={{
                  textAlign: 'left',
                  padding: '12px 20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#666',
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'pointer',
                }}
              >
                名称 {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: '12px 20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#666',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                PID
              </th>
              <th
                onClick={() => handleSort('cpu')}
                style={{
                  textAlign: 'right',
                  padding: '12px 20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#666',
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'pointer',
                }}
              >
                CPU {sortBy === 'cpu' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('memory')}
                style={{
                  textAlign: 'right',
                  padding: '12px 20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#666',
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'pointer',
                }}
              >
                内存 {sortBy === 'memory' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: '12px 20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#666',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedProcesses.map((process) => (
              <tr
                key={process.id}
                onClick={() => setSelectedProcess(process.id)}
                style={{
                  background: selectedProcess === process.id ? '#e3f2fd' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (selectedProcess !== process.id) {
                    (e.currentTarget as HTMLElement).style.background = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedProcess !== process.id) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                <td style={{ padding: '10px 20px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{getProcessIcon(process.type)}</span>
                    <span style={{ fontSize: '13px', color: '#333' }}>{process.name}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 20px', borderBottom: '1px solid #f0f0f0', textAlign: 'right', fontSize: '13px', color: '#666' }}>
                  {process.id}
                </td>
                <td style={{ padding: '10px 20px', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <div
                      style={{
                        width: '60px',
                        height: '8px',
                        background: '#e0e0e0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${process.cpuUsage}%`,
                          height: '100%',
                          background: process.cpuUsage > 80 ? '#e74c3c' : process.cpuUsage > 50 ? '#f39c12' : '#2ecc71',
                          borderRadius: '4px',
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '13px', color: '#666', minWidth: '40px' }}>
                      {process.cpuUsage.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td style={{ padding: '10px 20px', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <div
                      style={{
                        width: '60px',
                        height: '8px',
                        background: '#e0e0e0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${(process.memoryUsage / 2048) * 100}%`,
                          height: '100%',
                          background: process.memoryUsage > 1024 ? '#9b59b6' : '#3498db',
                          borderRadius: '4px',
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '13px', color: '#666', minWidth: '50px' }}>
                      {(process.memoryUsage / 1024).toFixed(1)} GB
                    </span>
                  </div>
                </td>
                <td style={{ padding: '10px 20px', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEndTask(process.id);
                    }}
                    style={{
                      padding: '4px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      background: '#e74c3c',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer',
                      opacity: 0.9,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.opacity = '0.9';
                    }}
                  >
                    结束
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: '12px 20px',
          background: '#fafafa',
          borderTop: '1px solid #e0e0e0',
          fontSize: '12px',
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>运行中: {sortedProcesses.length} 个进程</span>
        <span>上次更新: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default TaskManager;
