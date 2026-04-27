import type { 
  EventLoopState, 
  Task, 
  LogEntry, 
  TaskType,
  LoopConfig,
} from '../types/eventLoop';
import { EVENT_LOOP_PHASES } from '../types/eventLoop';

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

const generateLogEntry = (
  type: LogEntry['type'],
  message: string,
  phase?: TaskType,
  taskId?: string
): LogEntry => ({
  id: generateId(),
  timestamp: Date.now(),
  type,
  message,
  phase,
  taskId,
});

export class EventLoopSimulator {
  private state: EventLoopState;
  private config: LoopConfig;
  private animationFrameId: number | null = null;
  private lastTickTime: number = 0;
  private onStateChange: ((state: EventLoopState) => void) | null = null;
  private checkpointStates: Map<string, EventLoopState> = new Map();

  constructor(config: LoopConfig) {
    this.config = config;
    this.state = this.createInitialState();
  }

  private createInitialState(): EventLoopState {
    return {
      currentPhase: null,
      tickCount: 0,
      isRunning: false,
      isPaused: false,
      speed: this.config.speed,
      timestamp: 0,
      macroTasks: [],
      microTasks: [],
      completedTasks: [],
      logs: [generateLogEntry('info', '事件循环模拟器已初始化，等待任务...')],
    };
  }

  public setStateChangeListener(listener: (state: EventLoopState) => void): void {
    this.onStateChange = listener;
  }

  public getState(): EventLoopState {
    return { ...this.state };
  }

  public addMacroTask(task: Omit<Task, 'id' | 'status' | 'startTime' | 'endTime'>): void {
    const newTask: Task = {
      ...task,
      id: generateId(),
      status: 'pending',
    };
    this.state.macroTasks = [...this.state.macroTasks, newTask];
    this.state.logs = [
      ...this.state.logs,
      generateLogEntry('info', `添加宏任务: ${task.name}`, task.type as TaskType, newTask.id),
    ];
    this.notifyStateChange();
  }

  public addMicroTask(task: Omit<Task, 'id' | 'status' | 'startTime' | 'endTime'>): void {
    const newTask: Task = {
      ...task,
      id: generateId(),
      status: 'pending',
    };
    this.state.microTasks = [...this.state.microTasks, newTask];
    this.state.logs = [
      ...this.state.logs,
      generateLogEntry('info', `添加微任务: ${task.name}`, undefined, newTask.id),
    ];
    this.notifyStateChange();
  }

  public setConfig(config: Partial<LoopConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.speed !== undefined) {
      this.state.speed = config.speed;
    }
    this.state.logs = [
      ...this.state.logs,
      generateLogEntry('info', `配置已更新: ${JSON.stringify(config)}`),
    ];
    this.notifyStateChange();
  }

  public start(): void {
    if (this.state.isRunning) return;
    
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.state.logs = [
      ...this.state.logs,
      generateLogEntry('success', '事件循环开始运行'),
    ];
    this.notifyStateChange();
    this.lastTickTime = performance.now();
    this.runLoop();
  }

  public pause(): void {
    if (!this.state.isRunning || this.state.isPaused) return;
    
    this.state.isPaused = true;
    this.state.logs = [
      ...this.state.logs,
      generateLogEntry('warning', '事件循环已暂停'),
    ];
    this.notifyStateChange();
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public resume(): void {
    if (!this.state.isRunning || !this.state.isPaused) return;
    
    this.state.isPaused = false;
    this.state.logs = [
      ...this.state.logs,
      generateLogEntry('success', '事件循环已恢复'),
    ];
    this.notifyStateChange();
    this.lastTickTime = performance.now();
    this.runLoop();
  }

  public step(): void {
    this.executeSingleTick();
    this.state.logs = [
      ...this.state.logs,
      generateLogEntry('info', `单步执行完成 - 第 ${this.state.tickCount} 次迭代`),
    ];
    this.notifyStateChange();
  }

  public stop(): void {
    this.state.isRunning = false;
    this.state.isPaused = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.state.logs = [
      ...this.state.logs,
      generateLogEntry('warning', '事件循环已停止'),
    ];
    this.notifyStateChange();
  }

  public reset(): void {
    this.stop();
    this.state = this.createInitialState();
    this.checkpointStates.clear();
    this.notifyStateChange();
  }

  public saveCheckpoint(name: string): void {
    this.checkpointStates.set(name, JSON.parse(JSON.stringify(this.state)));
    this.state.logs = [
      ...this.state.logs,
      generateLogEntry('success', `检查点已保存: ${name}`),
    ];
    this.notifyStateChange();
  }

  public restoreCheckpoint(name: string): void {
    const checkpoint = this.checkpointStates.get(name);
    if (checkpoint) {
      this.stop();
      this.state = JSON.parse(JSON.stringify(checkpoint));
      this.state.logs = [
        ...this.state.logs,
        generateLogEntry('success', `已恢复到检查点: ${name}`),
      ];
      this.notifyStateChange();
    } else {
      this.state.logs = [
        ...this.state.logs,
        generateLogEntry('error', `检查点不存在: ${name}`),
      ];
      this.notifyStateChange();
    }
  }

  public getCheckpoints(): string[] {
    return Array.from(this.checkpointStates.keys());
  }

  private runLoop(): void {
    if (!this.state.isRunning || this.state.isPaused) return;

    const tick = (currentTime: number) => {
      if (!this.state.isRunning || this.state.isPaused) return;

      const elapsed = currentTime - this.lastTickTime;
      const tickInterval = this.config.asyncDelay / this.state.speed;

      if (elapsed >= tickInterval) {
        this.executeSingleTick();
        this.lastTickTime = currentTime;
      }

      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  private executeSingleTick(): void {
    this.state.tickCount++;
    this.state.timestamp = Date.now();
    
    this.state.logs = [
      ...this.state.logs,
      generateLogEntry('info', `开始第 ${this.state.tickCount} 次事件循环迭代`),
    ];

    for (const phase of EVENT_LOOP_PHASES) {
      if (!this.state.isRunning || this.state.isPaused) break;
      
      this.state.currentPhase = phase.name;
      this.state.logs = [
        ...this.state.logs,
        generateLogEntry('info', `进入阶段: ${phase.name}`, phase.name),
      ];
      this.notifyStateChange();

      this.executePhaseTasks(phase.name);
      this.executeAllMicroTasks();

      this.state.logs = [
        ...this.state.logs,
        generateLogEntry('info', `离开阶段: ${phase.name}`, phase.name),
      ];
    }

    this.state.currentPhase = null;
    this.state.logs = [
      ...this.state.logs,
      generateLogEntry('success', `第 ${this.state.tickCount} 次迭代完成`),
    ];
    this.notifyStateChange();
  }

  private executePhaseTasks(phase: TaskType): void {
    const tasksToExecute = this.state.macroTasks.filter(
      task => task.type === phase && task.status === 'pending'
    );

    for (const task of tasksToExecute) {
      if (!this.state.isRunning || this.state.isPaused) break;

      const taskIndex = this.state.macroTasks.findIndex(t => t.id === task.id);
      if (taskIndex === -1) continue;

      const updatedTask = {
        ...task,
        status: 'running' as const,
        startTime: Date.now(),
      };

      this.state.macroTasks[taskIndex] = updatedTask;
      this.state.logs = [
        ...this.state.logs,
        generateLogEntry('info', `开始执行任务: ${task.name}`, phase, task.id),
      ];
      this.notifyStateChange();

      try {
        task.callback();
        
        const completedTask = {
          ...updatedTask,
          status: 'completed' as const,
          endTime: Date.now(),
        };

        this.state.macroTasks = this.state.macroTasks.filter(t => t.id !== task.id);
        this.state.completedTasks = [...this.state.completedTasks, completedTask];
        
        this.state.logs = [
          ...this.state.logs,
          generateLogEntry('success', `任务完成: ${task.name}`, phase, task.id),
        ];
      } catch (error) {
        const errorTask = {
          ...updatedTask,
          status: 'error' as const,
          endTime: Date.now(),
          error: error instanceof Error ? error : new Error(String(error)),
        };

        this.state.macroTasks = this.state.macroTasks.filter(t => t.id !== task.id);
        this.state.completedTasks = [...this.state.completedTasks, errorTask];

        this.state.logs = [
          ...this.state.logs,
          generateLogEntry('error', `任务执行失败: ${task.name} - ${(error as Error).message}`, phase, task.id),
        ];
      }

      this.notifyStateChange();
    }
  }

  private executeAllMicroTasks(): void {
    while (this.state.microTasks.length > 0 && this.state.isRunning && !this.state.isPaused) {
      const task = this.state.microTasks.shift();
      if (!task) continue;

      const updatedTask = {
        ...task,
        status: 'running' as const,
        startTime: Date.now(),
      };

      this.state.logs = [
        ...this.state.logs,
        generateLogEntry('info', `开始执行微任务: ${task.name}`, undefined, task.id),
      ];
      this.notifyStateChange();

      try {
        task.callback();
        
        const completedTask = {
          ...updatedTask,
          status: 'completed' as const,
          endTime: Date.now(),
        };

        this.state.completedTasks = [...this.state.completedTasks, completedTask];
        this.state.logs = [
          ...this.state.logs,
          generateLogEntry('success', `微任务完成: ${task.name}`, undefined, task.id),
        ];
      } catch (error) {
        const errorTask = {
          ...updatedTask,
          status: 'error' as const,
          endTime: Date.now(),
          error: error instanceof Error ? error : new Error(String(error)),
        };

        this.state.completedTasks = [...this.state.completedTasks, errorTask];
        this.state.logs = [
          ...this.state.logs,
          generateLogEntry('error', `微任务执行失败: ${task.name} - ${(error as Error).message}`, undefined, task.id),
        ];
      }

      this.notifyStateChange();
    }
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  public getPerformanceStats(): {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    averageExecutionTime: number;
    totalExecutionTime: number;
  } {
    const completed = this.state.completedTasks.filter(t => t.endTime && t.startTime);
    const totalExecutionTime = completed.reduce(
      (sum, t) => sum + ((t.endTime || 0) - (t.startTime || 0)),
      0
    );

    return {
      totalTasks: this.state.completedTasks.length + this.state.macroTasks.length + this.state.microTasks.length,
      completedTasks: this.state.completedTasks.length,
      pendingTasks: this.state.macroTasks.length + this.state.microTasks.length,
      averageExecutionTime: completed.length > 0 ? totalExecutionTime / completed.length : 0,
      totalExecutionTime,
    };
  }
}
