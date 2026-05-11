import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '../entity/answer.entity';

@Provide()
@Scope(ScopeEnum.Singleton)
export class AnswerService {
  @InjectEntityModel(Answer)
  answerModel: Repository<Answer>;

  async submitAnswer(data: { userId: string; questionId: number; isCorrect: boolean }): Promise<Answer> {
    const answer = this.answerModel.create(data);
    return this.answerModel.save(answer);
  }

  async getAnswersByUserId(userId: string): Promise<Answer[]> {
    return this.answerModel.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async getUserStats(userId: string): Promise<{ total: number; correct: number }> {
    const answers = await this.answerModel.find({ where: { userId } });
    const total = answers.length;
    const correct = answers.filter(a => a.isCorrect).length;
    return { total, correct };
  }
}
