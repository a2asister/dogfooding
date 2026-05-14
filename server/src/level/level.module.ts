import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from '../entity/Level';
import { Progress } from '../entity/Progress';
import { WrongAnswer } from '../entity/WrongAnswer';
import { Score } from '../entity/Score';
import { DailyPractice } from '../entity/DailyPractice';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';
import { GameService } from '../game/game.service';

@Module({
  imports: [TypeOrmModule.forFeature([Level, Progress, WrongAnswer, Score, DailyPractice])],
  providers: [LevelService, GameService],
  controllers: [LevelController],
})
export class LevelModule {}
