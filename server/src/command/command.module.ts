import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Command } from './command.entity';
import { CommandService } from './command.service';
import { CommandController } from './command.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Command])],
  controllers: [CommandController],
  providers: [CommandService],
})
export class CommandModule {}
