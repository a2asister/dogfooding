import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { LevelService } from './level.service';
import { GameService } from '../game/game.service';

@Controller('levels')
export class LevelController {
  constructor(
    private levelService: LevelService,
    private gameService: GameService,
  ) {}

  @Get()
  findAll() {
    return this.levelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.levelService.findOne(+id);
  }

  @Post('submit')
  async submitAnswer(@Body() body: { levelId: number; userAnswer: string; correctAnswer: string; question: string; isCorrect: boolean; points: number }) {
    const result = await this.gameService.submitAnswer(
      body.levelId,
      body.userAnswer,
      body.correctAnswer,
      body.question,
      body.isCorrect,
      body.points,
    );
    if (body.isCorrect) {
      await this.levelService.unlockNextLevel(body.levelId);
    }
    return result;
  }
}
