import { Controller, Post, Get, Inject, Body, Param } from '@midwayjs/core';
import { AnswerService } from '../service/answer.service';

interface SubmitAnswerRequest {
  userId: string;
  questionId: number;
  isCorrect: boolean;
}

@Controller('/api/answers')
export class AnswerController {
  @Inject()
  answerService: AnswerService;

  @Post('/')
  async submitAnswer(@Body() body: SubmitAnswerRequest) {
    await this.answerService.submitAnswer({
      userId: body.userId,
      questionId: body.questionId,
      isCorrect: body.isCorrect
    });
    return { success: true };
  }

  @Get('/:userId')
  async getAnswers(@Param('userId') userId: string) {
    return this.answerService.getAnswersByUserId(userId);
  }
}
