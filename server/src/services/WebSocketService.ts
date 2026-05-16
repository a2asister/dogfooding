import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { JWT_SECRET, WS_PORT } from '../config';

interface UserConnection {
  ws: WebSocket;
  userId: number;
  lastHeartbeat: number;
}

const connections = new Map<number, UserConnection>();
const processedMessages = new Set<string>();

const HEARTBEAT_INTERVAL = 30000;
const HEARTBEAT_TIMEOUT = 60000;

const MESSAGE_TYPE_TEXT = 1;
const MESSAGE_TYPE_IMAGE = 2;
const MESSAGE_TYPE_FILE = 3;
const MESSAGE_TYPE_EMOJI = 4;

const CHAT_TYPE_PRIVATE = 1;
const CHAT_TYPE_GROUP = 2;

export function startWebSocketServer() {
  const wss = new WebSocketServer({ port: WS_PORT });

  wss.on('connection', (ws) => {
    let currentUserId: number | null = null;
    let heartbeatTimer: NodeJS.Timeout | null = null;

    heartbeatTimer = setInterval(() => {
      if (currentUserId) {
        const connection = connections.get(currentUserId);
        if (connection) {
          const now = Date.now();
          if (now - connection.lastHeartbeat > HEARTBEAT_TIMEOUT) {
            console.log(`用户 ${currentUserId} 心跳超时，断开连接`);
            ws.close();
            connections.delete(currentUserId);
          } else {
            ws.send(JSON.stringify({ type: 'heartbeat_ping' }));
          }
        }
      }
    }, HEARTBEAT_INTERVAL);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          const decoded = jwt.verify(message.token, JWT_SECRET) as { userId: number };
          currentUserId = decoded.userId;
          
          if (connections.has(currentUserId)) {
            const oldConn = connections.get(currentUserId);
            oldConn?.ws.close();
          }
          
          connections.set(currentUserId, { 
            ws, 
            userId: currentUserId,
            lastHeartbeat: Date.now()
          });
          
          console.log(`用户 ${currentUserId} 已连接`);
          
          await sendOfflineMessages(currentUserId);
          await processPendingMessages(currentUserId);
          
          ws.send(JSON.stringify({ 
            type: 'auth_success', 
            userId: currentUserId 
          }));
          return;
        }

        if (!currentUserId) {
          ws.send(JSON.stringify({ type: 'error', message: '未授权' }));
          return;
        }

        const connection = connections.get(currentUserId);
        if (connection) {
          connection.lastHeartbeat = Date.now();
        }

        if (message.type === 'heartbeat_pong') {
          if (connection) {
            connection.lastHeartbeat = Date.now();
          }
          return;
        }

        if (message.type === 'message') {
          if (processedMessages.has(message.messageId)) {
            ws.send(JSON.stringify({
              type: 'message_ack',
              messageId: message.messageId,
              status: 'duplicate'
            }));
            return;
          }
          processedMessages.add(message.messageId);

          const chatType = message.chatType || CHAT_TYPE_PRIVATE;
          const messageType = message.messageType || MESSAGE_TYPE_TEXT;

          if (chatType === CHAT_TYPE_PRIVATE) {
            await handlePrivateMessage(currentUserId, message, messageType);
          } else if (chatType === CHAT_TYPE_GROUP) {
            await handleGroupMessage(currentUserId, message, messageType);
          }

          ws.send(JSON.stringify({
            type: 'message_ack',
            messageId: message.messageId,
            status: 'sent'
          }));
        }

        if (message.type === 'recall_message') {
          await handleRecallMessage(currentUserId, message);
        }

        if (message.type === 'message_read') {
          await handleMessageRead(currentUserId, message);
        }

        if (message.type === 'typing') {
          await handleTyping(currentUserId, message);
        }

      } catch (err) {
        console.error('WebSocket 消息处理错误:', err);
        ws.send(JSON.stringify({ type: 'error', message: '消息处理失败' }));
      }
    });

    ws.on('close', () => {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
      }
      if (currentUserId) {
        console.log(`用户 ${currentUserId} 断开连接`);
        connections.delete(currentUserId);
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket 错误:', err);
    });
  });

  console.log(`WebSocket 服务已启动，端口: ${WS_PORT}`);
}

async function handlePrivateMessage(
  fromUserId: number, 
  message: any, 
  messageType: number
) {
  const fromUser = await new Promise<any>((resolve) => {
    db.get(
      'SELECT id, username, avatar FROM users WHERE id = ?',
      [fromUserId],
      (_, row) => resolve(row)
    );
  });

  await saveMessage({
    messageId: message.messageId,
    chatType: CHAT_TYPE_PRIVATE,
    fromUserId,
    toUserId: message.toUserId,
    groupId: null,
    messageType,
    content: message.content,
    mediaUrl: message.mediaUrl,
    mediaName: message.mediaName,
    mediaSize: message.mediaSize
  });

  const messageData = {
    type: 'message',
    chatType: CHAT_TYPE_PRIVATE,
    messageId: message.messageId,
    fromUserId,
    fromUsername: fromUser?.username || '未知用户',
    fromAvatar: fromUser?.avatar,
    toUserId: message.toUserId,
    messageType,
    content: message.content,
    mediaUrl: message.mediaUrl,
    mediaName: message.mediaName,
    mediaSize: message.mediaSize,
    createdAt: new Date().toISOString()
  };

  const targetConnection = connections.get(message.toUserId);
  if (targetConnection && targetConnection.ws.readyState === WebSocket.OPEN) {
    targetConnection.ws.send(JSON.stringify(messageData));
    console.log('发送私聊消息:', {
      fromUserId,
      fromUsername: fromUser?.username,
      toUserId: message.toUserId
    });
  } else {
    await savePendingMessage(message.messageId, messageData);
    console.log('用户离线，保存待发送私聊消息:', message.toUserId);
  }
}

async function handleGroupMessage(
  fromUserId: number, 
  message: any, 
  messageType: number
) {
  const groupId = message.groupId;
  
  const isMember = await checkGroupMember(groupId, fromUserId);
  if (!isMember) {
    throw new Error('不是群成员');
  }

  const fromUser = await new Promise<any>((resolve) => {
    db.get(
      'SELECT id, username, avatar FROM users WHERE id = ?',
      [fromUserId],
      (_, row) => resolve(row)
    );
  });

  await saveMessage({
    messageId: message.messageId,
    chatType: CHAT_TYPE_GROUP,
    fromUserId,
    toUserId: null,
    groupId,
    messageType,
    content: message.content,
    mediaUrl: message.mediaUrl,
    mediaName: message.mediaName,
    mediaSize: message.mediaSize
  });

  const members = await getGroupMembers(groupId);
  const messageData = {
    type: 'message',
    chatType: CHAT_TYPE_GROUP,
    messageId: message.messageId,
    fromUserId,
    fromUsername: fromUser?.username || '未知用户',
    fromAvatar: fromUser?.avatar,
    groupId,
    messageType,
    content: message.content,
    mediaUrl: message.mediaUrl,
    mediaName: message.mediaName,
    mediaSize: message.mediaSize,
    createdAt: new Date().toISOString()
  };

  console.log('发送群消息:', {
    groupId,
    fromUserId,
    fromUsername: fromUser?.username,
    memberCount: members.length,
    messageId: message.messageId
  });

  for (const member of members) {
    if (member.user_id === fromUserId) continue;
    
    const targetConnection = connections.get(member.user_id);
    if (targetConnection && targetConnection.ws.readyState === WebSocket.OPEN) {
      targetConnection.ws.send(JSON.stringify(messageData));
      console.log('已发送给用户:', member.user_id);
    } else {
      await savePendingMessage(message.messageId, {
        ...messageData,
        toUserId: member.user_id
      });
      console.log('用户离线，保存待发送:', member.user_id);
    }
  }
}

async function handleRecallMessage(fromUserId: number, message: any) {
  const { messageId } = message;
  
  const result = await new Promise<any>((resolve) => {
    db.get(
      `SELECT *, 
        (julianday('now') - julianday(created_at)) * 24 * 60 as diff_minutes
       FROM messages WHERE message_id = ? AND from_user_id = ? AND is_recalled = 0`,
      [messageId, fromUserId],
      (_, row) => resolve(row)
    );
  });

  if (!result) {
    return;
  }

  if (result.diff_minutes > 2) {
    return;
  }

  await new Promise((resolve) => {
    db.run(
      'UPDATE messages SET is_recalled = 1 WHERE message_id = ?',
      [messageId],
      () => resolve(null)
    );
  });

  const recallData = {
    type: 'message_recalled',
    messageId,
    chatType: result.chat_type,
    fromUserId,
    toUserId: result.to_user_id,
    groupId: result.group_id
  };

  if (result.chat_type === CHAT_TYPE_PRIVATE && result.to_user_id) {
    const targetConnection = connections.get(result.to_user_id);
    if (targetConnection && targetConnection.ws.readyState === WebSocket.OPEN) {
      targetConnection.ws.send(JSON.stringify(recallData));
    }
  } else if (result.chat_type === CHAT_TYPE_GROUP && result.group_id) {
    const members = await getGroupMembers(result.group_id);
    for (const member of members) {
      const targetConnection = connections.get(member.user_id);
      if (targetConnection && targetConnection.ws.readyState === WebSocket.OPEN) {
        targetConnection.ws.send(JSON.stringify(recallData));
      }
    }
  }
}

async function handleMessageRead(userId: number, message: any) {
  const { messageId, chatType, fromUserId, groupId } = message;
  
  await new Promise((resolve) => {
    db.run(
      'INSERT OR REPLACE INTO message_read_status (message_id, user_id, is_read, read_at) VALUES (?, ?, 1, ?)',
      [messageId, userId, new Date().toISOString()],
      () => resolve(null)
    );
  });

  const readData = {
    type: 'message_read_ack',
    messageId,
    userId,
    chatType
  };

  if (chatType === CHAT_TYPE_PRIVATE && fromUserId) {
    const targetConnection = connections.get(fromUserId);
    if (targetConnection && targetConnection.ws.readyState === WebSocket.OPEN) {
      targetConnection.ws.send(JSON.stringify(readData));
    }
  } else if (chatType === CHAT_TYPE_GROUP && groupId) {
    const members = await getGroupMembers(groupId);
    for (const member of members) {
      if (member.user_id === userId) continue;
      const targetConnection = connections.get(member.user_id);
      if (targetConnection && targetConnection.ws.readyState === WebSocket.OPEN) {
        targetConnection.ws.send(JSON.stringify(readData));
      }
    }
  }
}

async function handleTyping(userId: number, message: any) {
  const { chatType, targetId, isTyping } = message;
  
  const typingData = {
    type: 'typing_status',
    userId,
    chatType,
    targetId,
    isTyping
  };

  if (chatType === CHAT_TYPE_PRIVATE) {
    const targetConnection = connections.get(targetId);
    if (targetConnection && targetConnection.ws.readyState === WebSocket.OPEN) {
      targetConnection.ws.send(JSON.stringify(typingData));
    }
  } else if (chatType === CHAT_TYPE_GROUP) {
    const members = await getGroupMembers(targetId);
    for (const member of members) {
      if (member.user_id === userId) continue;
      const targetConnection = connections.get(member.user_id);
      if (targetConnection && targetConnection.ws.readyState === WebSocket.OPEN) {
        targetConnection.ws.send(JSON.stringify(typingData));
      }
    }
  }
}

async function saveMessage(params: {
  messageId: string;
  chatType: number;
  fromUserId: number;
  toUserId: number | null;
  groupId: string | null;
  messageType: number;
  content: string;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
}) {
  const createdAt = new Date().toISOString();
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO messages (
        message_id, chat_type, from_user_id, to_user_id, group_id,
        message_type, content, media_url, media_name, media_size, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        params.messageId, params.chatType, params.fromUserId, params.toUserId, params.groupId,
        params.messageType, params.content, params.mediaUrl, params.mediaName, params.mediaSize,
        createdAt
      ],
      function (err) {
        if (err) {
          console.error('保存消息失败:', err);
          reject(err);
        } else {
          resolve(null);
        }
      }
    );
  });
}

async function savePendingMessage(messageId: string, messageData: any) {
  return new Promise((resolve) => {
    db.run(
      'INSERT OR IGNORE INTO pending_messages (message_id, message_data) VALUES (?, ?)',
      [messageId, JSON.stringify(messageData)],
      () => resolve(null)
    );
  });
}

async function processPendingMessages(userId: number) {
  const pending = await new Promise<any[]>((resolve) => {
    db.all(
      'SELECT * FROM pending_messages WHERE retry_count < max_retries ORDER BY created_at ASC',
      [],
      (_, rows) => resolve(rows || [])
    );
  });

  const connection = connections.get(userId);
  if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
    return;
  }

  for (const msg of pending) {
    const messageData = JSON.parse(msg.message_data);
    if (messageData.toUserId === userId || messageData.groupId) {
      try {
        connection.ws.send(JSON.stringify(messageData));
        await new Promise((resolve) => {
          db.run('DELETE FROM pending_messages WHERE id = ?', [msg.id], () => resolve(null));
        });
      } catch (e) {
        await new Promise((resolve) => {
          db.run(
            'UPDATE pending_messages SET retry_count = retry_count + 1 WHERE id = ?',
            [msg.id],
            () => resolve(null)
          );
        });
      }
    }
  }
}

async function sendOfflineMessages(userId: number) {
  const messages = await new Promise<any[]>((resolve) => {
    db.all(
      `SELECT m.*, u.username as from_username 
       FROM messages m
       JOIN users u ON m.from_user_id = u.id
       WHERE m.to_user_id = ? AND m.is_read = 0 AND m.is_recalled = 0 AND m.is_deleted = 0
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
        chatType: msg.chat_type,
        messageId: msg.message_id,
        fromUserId: Number(msg.from_user_id),
        toUserId: Number(msg.to_user_id),
        messageType: msg.message_type,
        content: msg.content,
        mediaUrl: msg.media_url,
        mediaName: msg.media_name,
        mediaSize: msg.media_size,
        createdAt: msg.created_at,
        fromUsername: msg.from_username
      }));
    });
  }
}

async function checkGroupMember(groupId: string, userId: number): Promise<boolean> {
  return new Promise((resolve) => {
    db.get(
      'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId],
      (_, row) => resolve(!!row)
    );
  });
}

async function getGroupMembers(groupId: string): Promise<any[]> {
  return new Promise((resolve) => {
    db.all(
      'SELECT user_id FROM group_members WHERE group_id = ?',
      [groupId],
      (_, rows) => resolve(rows || [])
    );
  });
}

export { connections };
