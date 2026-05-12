import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class KanbanGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('taskMoved')
  handleTaskMoved(client: Socket, payload: any) {
    client.broadcast.emit('taskMoved', payload);
  }

  @SubscribeMessage('taskUpdated')
  handleTaskUpdated(client: Socket, payload: any) {
    client.broadcast.emit('taskUpdated', payload);
  }
}
