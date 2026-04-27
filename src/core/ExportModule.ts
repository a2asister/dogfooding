import type { EventLoopState, LogEntry, Task } from '../types/eventLoop';

interface SanitizedTask {
  id: string;
  type: string;
  name: string;
  delay: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime?: number;
  endTime?: number;
  error?: { message: string };
  parentId?: string;
}

export class ExportModule {
  public exportStateAsJSON(state: EventLoopState): string {
    const exportData = {
      exportedAt: new Date().toISOString(),
      state: {
        currentPhase: state.currentPhase,
        tickCount: state.tickCount,
        isRunning: state.isRunning,
        isPaused: state.isPaused,
        speed: state.speed,
        timestamp: state.timestamp,
        macroTasks: this.sanitizeTasks(state.macroTasks),
        microTasks: this.sanitizeTasks(state.microTasks),
        completedTasks: this.sanitizeTasks(state.completedTasks),
        logs: state.logs,
      },
    };

    return JSON.stringify(exportData, null, 2);
  }

  public exportLogsAsText(logs: LogEntry[]): string {
    return logs
      .map((log) => {
        const time = new Date(log.timestamp).toISOString();
        const phaseStr = log.phase ? ` [${log.phase}]` : '';
        return `[${time}] [${log.type.toUpperCase()}]${phaseStr} ${log.message}`;
      })
      .join('\n');
  }

  public downloadJSON(data: string, filename: string = 'event-loop-state.json'): void {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    this.downloadUrl(url, filename);
    URL.revokeObjectURL(url);
  }

  public downloadText(data: string, filename: string = 'event-loop-logs.txt'): void {
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    this.downloadUrl(url, filename);
    URL.revokeObjectURL(url);
  }

  private sanitizeTasks(tasks: Task[]): SanitizedTask[] {
    return tasks.map(({ callback, ...rest }) => ({
      id: rest.id,
      type: rest.type,
      name: rest.name,
      delay: rest.delay,
      status: rest.status,
      startTime: rest.startTime,
      endTime: rest.endTime,
      parentId: rest.parentId,
      error: rest.error ? { message: rest.error.message } : undefined,
    }));
  }

  private downloadUrl(url: string, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public triggerBrowserScreenshot(): void {
    alert(
      '请使用浏览器自带的截图功能：\n\n' +
      'Mac: Command + Shift + 4 (选区) 或 Command + Shift + 5 (录制)\n' +
      'Windows: Win + Shift + S\n' +
      'Chrome DevTools: F12 → Ctrl+Shift+P → 输入 "screenshot"'
    );
  }
}
