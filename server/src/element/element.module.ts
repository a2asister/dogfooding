import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Element } from '../entities/element.entity';
import { ElementService } from './element.service';
import { ElementController } from './element.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Element])],
  controllers: [ElementController],
  providers: [ElementService],
  exports: [ElementService],
})
export class ElementModule {}
