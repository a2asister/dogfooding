import { WebSocketServer, WebSocket } from 'ws';
import type { Server as HttpServer } from 'http';
import type { ProcessProgress } from './types';

const clients = new Map<string, WebSocket>();

export function setupWebSocket(server: HttpServer): void {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(2, 15);
    clients.set(clientId, ws);

    ws.on('close', () => {
      clients.delete(clientId);
    });

    ws.on('error', () => {
      clients.delete(clientId);
    });
  });
}

export function broadcastProgress(progress: ProcessProgress): void {
  const message = JSON.stringify({ type: 'progress', data: progress });
  for (const ws of clients.values()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}

export function getClientCount(): number {
  return clients.size;
}
