import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Measurement } from './measurement.entity';
import { MeasurementService } from './measurement.service';
import { MeasurementController } from './measurement.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Measurement])],
  controllers: [MeasurementController],
  providers: [MeasurementService],
})
export class MeasurementModule {}
