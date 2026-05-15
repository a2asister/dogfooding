import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DesktopService } from './desktop.service';
import { DesktopController } from './desktop.controller';
import { DesktopConfig } from '../entities/desktop-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DesktopConfig])],
  controllers: [DesktopController],
  providers: [DesktopService],
  exports: [DesktopService],
})
export class DesktopModule {}