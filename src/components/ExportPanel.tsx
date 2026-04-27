import { useState, useRef } from 'react';
import { ExportModule } from '../core/ExportModule';
import type { EventLoopState } from '../types/eventLoop';

interface ExportPanelProps {
  state: EventLoopState;
}

export function ExportPanel({ state }: ExportPanelProps) {
  const [status, setStatus] = useState<string>('');
  const exportModuleRef = useRef(new ExportModule());

  const showStatus = (message: string) => {
    setStatus(message);
    setTimeout(() => setStatus(''), 4000);
  };

  const handleScreenshot = () => {
    exportModuleRef.current.triggerBrowserScreenshot();
  };

  const handleExportState = () => {
    try {
      const json = exportModuleRef.current.exportStateAsJSON(state);
      exportModuleRef.current.downloadJSON(
        json,
        `event-loop-state-${Date.now()}.json`
      );
      showStatus('状态数据已导出！');
    } catch (error) {
      console.error('导出状态失败:', error);
      showStatus(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const handleExportLogs = () => {
    try {
      const text = exportModuleRef.current.exportLogsAsText(state.logs);
      exportModuleRef.current.downloadText(
        text,
        `event-loop-logs-${Date.now()}.txt`
      );
      showStatus('日志已导出！');
    } catch (error) {
      console.error('导出日志失败:', error);
      showStatus(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>数据导出</h2>
      </div>
      
      {status && (
        <div style={{
          padding: '10px 15px',
          marginBottom: '15px',
          borderRadius: '6px',
          backgroundColor: 'rgba(81, 207, 102, 0.1)',
          color: 'var(--success-color)',
          fontSize: '0.9rem',
        }}>
          {status}
        </div>
      )}

      <div className="export-section">
        <h3>截图与录制</h3>
        
        <div style={{ 
          padding: '15px',
          backgroundColor: 'var(--bg-color)',
          borderRadius: '8px',
          marginBottom: '15px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ 
            marginBottom: '10px', 
            fontWeight: '500',
            color: 'var(--text-color)'
          }}>
            ⚠️ 关于截图和视频录制
          </p>
          <p style={{ 
            fontSize: '0.85rem', 
            color: 'var(--text-light)',
            marginBottom: '10px'
          }}>
            由于浏览器安全策略限制，纯前端应用无法直接捕获屏幕内容。
            请使用以下方法进行截图和录制：
          </p>
          
          <button
            className="btn btn-secondary"
            onClick={handleScreenshot}
            style={{ marginTop: '5px' }}
          >
            📷 查看截图快捷键
          </button>
        </div>

        <div style={{ 
          fontSize: '0.8rem', 
          color: 'var(--text-light)', 
          padding: '10px 15px',
          backgroundColor: 'rgba(97, 218, 251, 0.05)',
          borderRadius: '6px',
          borderLeft: '3px solid var(--primary-color)'
        }}>
          <strong>推荐方案：</strong>
          <ul style={{ margin: '8px 0 0 20px', padding: 0, lineHeight: '1.6' }}>
            <li><strong>Mac 截图：</strong><code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>Command + Shift + 4</code> (选区) 或 <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>Command + Shift + 3</code> (全屏)</li>
            <li><strong>Mac 录制：</strong><code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>Command + Shift + 5</code></li>
            <li><strong>Windows 截图：</strong><code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>Win + Shift + S</code></li>
            <li><strong>Chrome DevTools：</strong>按 <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>F12</code> → <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>Ctrl+Shift+P</code> → 输入 "screenshot"</li>
            <li><strong>录屏软件：</strong>OBS Studio、QuickTime Player、Xbox Game Bar 等</li>
          </ul>
        </div>
      </div>
      
      <div className="export-section">
        <h3>数据导出</h3>
        <p style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-light)',
          marginBottom: '12px'
        }}>
          导出当前事件循环的状态数据和运行日志，用于教学复盘和内容分享。
        </p>
        <div className="export-buttons">
          <button
            className="btn btn-secondary"
            onClick={handleExportState}
          >
            📄 导出状态 (JSON)
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleExportLogs}
          >
            📝 导出日志 (TXT)
          </button>
        </div>
        
        <div style={{ 
          marginTop: '12px',
          fontSize: '0.75rem',
          color: 'var(--text-light)',
          padding: '8px 12px',
          backgroundColor: 'var(--bg-color)',
          borderRadius: '4px'
        }}>
          <strong>导出内容说明：</strong>
          <ul style={{ margin: '5px 0 0 18px', padding: 0 }}>
            <li><strong>状态 JSON：</strong>包含当前所有任务、阶段、配置信息</li>
            <li><strong>日志 TXT：</strong>包含完整的运行日志，可用于复盘分析</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
