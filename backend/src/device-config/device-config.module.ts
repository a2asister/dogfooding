import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceConfigService } from './device-config.service';
import { DeviceConfigController } from './device-config.controller';
import { DeviceConfig } from '../entity/device-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceConfig])],
  controllers: [DeviceConfigController],
  providers: [DeviceConfigService],
})
export class DeviceConfigModule {}