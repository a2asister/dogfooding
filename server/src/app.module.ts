import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from './entity/Level';
import { Progress } from './entity/Progress';
import { WrongAnswer } from './entity/WrongAnswer';
import { Score } from './entity/Score';
import { DailyPractice } from './entity/DailyPractice';
import { LevelModule } from './level/level.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Level, Progress, WrongAnswer, Score, DailyPractice],
      synchronize: true,
    }),
    LevelModule,
    GameModule,
  ],
})
export class AppModule {}
