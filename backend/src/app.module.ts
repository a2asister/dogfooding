import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeartRate } from './heart-rate.entity';
import { HeartRateGateway } from './heart-rate.gateway';
import { HeartRateController } from './heart-rate.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'heart-rate.db',
      entities: [HeartRate],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([HeartRate]),
  ],
  controllers: [HeartRateController],
  providers: [HeartRateGateway],
})
export class AppModule {}
