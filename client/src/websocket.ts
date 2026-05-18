import { ref } from 'vue';
import type { ProcessProgress } from './types';

const progressMap = ref<Map<string, ProcessProgress>>(new Map());
let ws: WebSocket | null = null;
let reconnectTimer: number | null = null;

function connect(): void {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  ws = new WebSocket(wsUrl);

  ws.onopen = (): void => {
    console.log('WebSocket连接成功');
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  ws.onmessage = (event: MessageEvent<string>): void => {
    try {
      const message = JSON.parse(event.data) as { type: string; data: ProcessProgress };
      if (message.type === 'progress') {
        progressMap.value.set(message.data.taskId, message.data);
      }
    } catch {
      // ignore parse errors
    }
  };

  ws.onclose = (): void => {
    console.log('WebSocket连接关闭，准备重连...');
    if (reconnectTimer === null) {
      reconnectTimer = window.setTimeout(() => {
        connect();
      }, 3000);
    }
  };

  ws.onerror = (): void => {
    console.error('WebSocket连接错误');
  };
}

export function initWebSocket(): void {
  if (ws === null) {
    connect();
  }
}

export function getProgress(taskId: string): ProcessProgress | null {
  return progressMap.value.get(taskId) ?? null;
}

export function clearProgress(taskId: string): void {
  progressMap.value.delete(taskId);
}
