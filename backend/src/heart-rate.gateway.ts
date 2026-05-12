import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeartRate } from './heart-rate.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class HeartRateGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private simulationInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(HeartRate)
    private heartRateRepository: Repository<HeartRate>,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    if (!this.simulationInterval) {
      this.startSimulation();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('heart-rate-data')
  async handleHeartRateData(client: Socket, payload: { rate: number }) {
    const heartRate = this.heartRateRepository.create({ rate: payload.rate });
    await this.heartRateRepository.save(heartRate);
    this.server.emit('heart-rate-update', payload);
  }

  private startSimulation() {
    this.simulationInterval = setInterval(async () => {
      const simulatedRate = 65 + Math.floor(Math.random() * 20);
      const heartRate = this.heartRateRepository.create({ rate: simulatedRate });
      await this.heartRateRepository.save(heartRate);
      this.server.emit('heart-rate-update', { rate: simulatedRate });
    }, 2000);
  }
}
