export type TaskType = 'timer' | 'pending' | 'idle' | 'prepare' | 'poll' | 'check' | 'close' | 'closeCallbacks';
export type MicroTaskType = 'promise' | 'nextTick' | 'queueMicrotask';

export interface Task {
  id: string;
  type: TaskType | MicroTaskType;
  name: string;
  callback: () => void;
  delay: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime?: number;
  endTime?: number;
  error?: Error;
  parentId?: string;
}

export interface EventLoopPhase {
  name: TaskType;
  description: string;
  order: number;
}

export interface EventLoopState {
  currentPhase: TaskType | null;
  tickCount: number;
  isRunning: boolean;
  isPaused: boolean;
  speed: number;
  timestamp: number;
  macroTasks: Task[];
  microTasks: Task[];
  completedTasks: Task[];
  logs: LogEntry[];
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  phase?: TaskType;
  taskId?: string;
}

export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  tasks: Omit<Task, 'id' | 'status' | 'startTime' | 'endTime'>[];
  config: LoopConfig;
}

export interface LoopConfig {
  loopDuration: number;
  taskTypeCount: number;
  asyncDelay: number;
  speed: number;
}

export const EVENT_LOOP_PHASES: EventLoopPhase[] = [
  { name: 'timer', description: '执行 setTimeout、setInterval 回调', order: 1 },
  { name: 'pending', description: '执行延迟到下一个循环迭代的 I/O 回调', order: 2 },
  { name: 'idle', description: '仅系统内部使用', order: 3 },
  { name: 'prepare', description: '仅系统内部使用', order: 4 },
  { name: 'poll', description: '检索新的 I/O 事件，执行 I/O 相关的回调', order: 5 },
  { name: 'check', description: '执行 setImmediate 回调', order: 6 },
  { name: 'closeCallbacks', description: '执行关闭事件的回调，如 socket.on(\'close\', ...)', order: 7 },
];

export const MICRO_TASK_TYPES: MicroTaskType[] = ['promise', 'nextTick', 'queueMicrotask'];

export const MACRO_TASK_TYPES: TaskType[] = ['timer', 'pending', 'poll', 'check', 'closeCallbacks'];

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'timeout-poll',
    name: '定时轮询场景',
    description: '演示 setTimeout 与 I/O 轮询的执行顺序',
    tasks: [
      { type: 'timer', name: 'setTimeout 100ms', callback: () => {}, delay: 100 },
      { type: 'timer', name: 'setTimeout 50ms', callback: () => {}, delay: 50 },
      { type: 'poll', name: 'I/O 读取文件', callback: () => {}, delay: 150 },
      { type: 'check', name: 'setImmediate', callback: () => {}, delay: 0 },
    ],
    config: {
      loopDuration: 1000,
      taskTypeCount: 4,
      asyncDelay: 100,
      speed: 1,
    },
  },
  {
    id: 'promise-chain',
    name: 'Promise 链式执行',
    description: '演示 Promise 微任务与宏任务的执行顺序',
    tasks: [
      { type: 'timer', name: 'setTimeout 0ms', callback: () => {}, delay: 0 },
      { type: 'promise', name: 'Promise.resolve().then()', callback: () => {}, delay: 0 },
      { type: 'promise', name: 'Promise.then().then()', callback: () => {}, delay: 0 },
      { type: 'nextTick', name: 'process.nextTick', callback: () => {}, delay: 0 },
    ],
    config: {
      loopDuration: 500,
      taskTypeCount: 4,
      asyncDelay: 50,
      speed: 1,
    },
  },
  {
    id: 'nested-timers',
    name: '定时器嵌套场景',
    description: '演示嵌套定时器的执行顺序',
    tasks: [
      { type: 'timer', name: '外层 setTimeout 10ms', callback: () => {}, delay: 10 },
      { type: 'timer', name: '内层 setTimeout 0ms', callback: () => {}, delay: 0, parentId: 'outer' },
      { type: 'check', name: 'setImmediate', callback: () => {}, delay: 0 },
      { type: 'promise', name: 'Promise 回调', callback: () => {}, delay: 0 },
    ],
    config: {
      loopDuration: 800,
      taskTypeCount: 4,
      asyncDelay: 80,
      speed: 1,
    },
  },
];
