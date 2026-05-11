import { Controller, Get, Inject } from '@midwayjs/core';
import { QuestionService } from '../service/question.service';

@Controller('/api/questions')
export class QuestionController {
  @Inject()
  questionService: QuestionService;

  @Get('/')
  async getAllQuestions() {
    return this.questionService.getAllQuestions();
  }
}
