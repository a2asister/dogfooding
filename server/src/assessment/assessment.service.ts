import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from '../entity/assessment.entity';
import { Answer } from '../entity/answer.entity';
import { UserPreference } from '../entity/user-preference.entity';

@Injectable()
export class AssessmentService {
  constructor(
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    @InjectRepository(UserPreference)
    private userPreferenceRepository: Repository<UserPreference>,
  ) {}

  async saveAssessment(userId: string, answers: any[], result: any) {
    const assessment = this.assessmentRepository.create({
      userId,
      result,
    });
    const savedAssessment = await this.assessmentRepository.save(assessment);

    const answerEntities = answers.map((a) =>
      this.answerRepository.create({
        questionId: a.questionId,
        answer: a.answer,
        score: a.score,
        assessmentId: savedAssessment.id,
      }),
    );
    await this.answerRepository.save(answerEntities);

    await this.updateUserPreference(userId, result.tags);

    return savedAssessment;
  }

  async getHistory(userId: string) {
    return this.assessmentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['answers'],
    });
  }

  async getTagStats(userId: string) {
    const pref = await this.userPreferenceRepository.findOne({ where: { userId } });
    return pref ? pref.tagStats : {};
  }

  private async updateUserPreference(userId: string, tags: string[]) {
    let pref = await this.userPreferenceRepository.findOne({ where: { userId } });
    if (!pref) {
      pref = this.userPreferenceRepository.create({
        userId,
        tagStats: {},
        totalAssessments: 0,
      });
    }

    tags.forEach((tag) => {
      pref.tagStats[tag] = (pref.tagStats[tag] || 0) + 1;
    });
    pref.totalAssessments += 1;

    await this.userPreferenceRepository.save(pref);
  }
}
