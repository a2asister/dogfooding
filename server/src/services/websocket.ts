import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface BidMessage {
  type: 'bid';
  auctionId: number;
  amount: number;
  userId: number;
  nickname: string;
}

interface SubscribeMessage {
  type: 'subscribe';
  auctionId: number;
}

type WsMessage = BidMessage | SubscribeMessage;

const auctionSubscribers = new Map<number, Set<WebSocket>>();

export function initWebSocket(server: Server): void {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (data: string) => {
      try {
        const message: WsMessage = JSON.parse(data);
        
        if (message.type === 'subscribe') {
          const { auctionId } = message;
          if (!auctionSubscribers.has(auctionId)) {
            auctionSubscribers.set(auctionId, new Set());
          }
          auctionSubscribers.get(auctionId)?.add(ws);
        } else if (message.type === 'bid') {
          broadcastBid(message);
        }
      } catch {
        console.error('WebSocket message parse error');
      }
    });

    ws.on('close', () => {
      auctionSubscribers.forEach((subscribers) => {
        subscribers.delete(ws);
      });
    });
  });
}

export function broadcastBid(bid: BidMessage): void {
  const subscribers = auctionSubscribers.get(bid.auctionId);
  if (subscribers) {
    const message = JSON.stringify({
      type: 'newBid',
      auctionId: bid.auctionId,
      amount: bid.amount,
      userId: bid.userId,
      nickname: bid.nickname,
      timestamp: Date.now()
    });
    
    subscribers.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

export function broadcastAuctionUpdate(auctionId: number, updates: Record<string, unknown>): void {
  const subscribers = auctionSubscribers.get(auctionId);
  if (subscribers) {
    const message = JSON.stringify({
      type: 'auctionUpdate',
      auctionId,
      ...updates
    });
    
    subscribers.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
