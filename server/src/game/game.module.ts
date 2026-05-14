import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from '../entity/Progress';
import { WrongAnswer } from '../entity/WrongAnswer';
import { Score } from '../entity/Score';
import { DailyPractice } from '../entity/DailyPractice';
import { GameService } from './game.service';
import { GameController } from './game.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Progress, WrongAnswer, Score, DailyPractice])],
  providers: [GameService],
  controllers: [GameController],
})
export class GameModule {}
