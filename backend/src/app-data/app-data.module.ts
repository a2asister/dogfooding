import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataService } from './app-data.service';
import { AppDataController } from './app-data.controller';
import { AppData } from '../entities/app-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppData])],
  controllers: [AppDataController],
  providers: [AppDataService],
  exports: [AppDataService],
})
export class AppDataModule {}
