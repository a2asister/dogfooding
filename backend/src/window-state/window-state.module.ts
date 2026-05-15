import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WindowStateService } from './window-state.service';
import { WindowStateController } from './window-state.controller';
import { WindowState } from '../entities/window-state.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WindowState])],
  controllers: [WindowStateController],
  providers: [WindowStateService],
  exports: [WindowStateService],
})
export class WindowStateModule {}
