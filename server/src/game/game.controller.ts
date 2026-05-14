import { Controller, Get } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Get('progress')
  getProgress() {
    return this.gameService.getProgress();
  }

  @Get('wrong-answers')
  getWrongAnswers() {
    return this.gameService.getWrongAnswers();
  }

  @Get('score')
  getScore() {
    return this.gameService.getScore();
  }

  @Get('daily-practices')
  getDailyPractices() {
    return this.gameService.getDailyPractices();
  }
}
