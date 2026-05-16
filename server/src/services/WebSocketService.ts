import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { JWT_SECRET, WS_PORT } from '../config';

interface UserConnection {
  ws: WebSocket;
  userId: number;
}

const connections = new Map<number, UserConnection>();
const processedMessages = new Set<string>();

export function startWebSocketServer() {
  const wss = new WebSocketServer({ port: WS_PORT });

  wss.on('connection', (ws) => {
    let currentUserId: number | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          const decoded = jwt.verify(message.token, JWT_SECRET) as { userId: number };
          currentUserId = decoded.userId;
          connections.set(currentUserId, { ws, userId: currentUserId });
          
          sendOfflineMessages(currentUserId);
          return;
        }

        if (!currentUserId) {
          ws.send(JSON.stringify({ type: 'error', message: '未授权' }));
          return;
        }

        if (message.type === 'message') {
          if (processedMessages.has(message.messageId)) {
            return;
          }
          processedMessages.add(message.messageId);

          await saveMessage({
            messageId: message.messageId,
            fromUserId: currentUserId,
            toUserId: message.toUserId,
            content: message.content
          });

          const targetConnection = connections.get(message.toUserId);
          if (targetConnection && targetConnection.ws.readyState === WebSocket.OPEN) {
            targetConnection.ws.send(JSON.stringify({
              type: 'message',
              messageId: message.messageId,
              fromUserId: currentUserId,
              toUserId: message.toUserId,
              content: message.content,
              createdAt: new Date().toISOString()
            }));
          }

          ws.send(JSON.stringify({
            type: 'message_ack',
            messageId: message.messageId
          }));
        }

        if (message.type === 'heartbeat') {
          ws.send(JSON.stringify({ type: 'heartbeat_ack' }));
        }
      } catch (err) {
        console.error('WebSocket 消息处理错误:', err);
      }
    });

    ws.on('close', () => {
      if (currentUserId) {
        connections.delete(currentUserId);
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket 错误:', err);
    });
  });

  console.log(`WebSocket 服务已启动，端口: ${WS_PORT}`);
}

async function saveMessage(params: {
  messageId: string;
  fromUserId: number;
  toUserId: number;
  content: string;
}) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO messages (message_id, from_user_id, to_user_id, content) VALUES (?, ?, ?, ?)',
      [params.messageId, params.fromUserId, params.toUserId, params.content],
      function (err) {
        if (err) {
          console.error('保存消息失败:', err);
          reject(err);
        } else {
          console.log(`消息已保存: messageId=${params.messageId}, from=${params.fromUserId}, to=${params.toUserId}`);
          resolve(null);
        }
      }
    );
  });
}

async function sendOfflineMessages(userId: number) {
  const messages = await new Promise<any[]>((resolve) => {
    db.all(
      `SELECT m.*, u.username as from_username 
       FROM messages m
       JOIN users u ON m.from_user_id = u.id
       WHERE m.to_user_id = ? AND m.is_read = 0
       ORDER BY m.created_at ASC`,
      [userId],
      (_, rows) => resolve(rows || [])
    );
  });

  const connection = connections.get(userId);
  if (connection && connection.ws.readyState === WebSocket.OPEN) {
    messages.forEach((msg) => {
      connection.ws.send(JSON.stringify({
        type: 'message',
        messageId: msg.message_id,
        fromUserId: Number(msg.from_user_id),
        toUserId: Number(msg.to_user_id),
        content: msg.content,
        createdAt: msg.created_at,
        fromUsername: msg.from_username
      }));
    });
  }
}
