import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progress } from '../entity/Progress';
import { WrongAnswer } from '../entity/WrongAnswer';
import { Score } from '../entity/Score';
import { DailyPractice } from '../entity/DailyPractice';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
    @InjectRepository(WrongAnswer)
    private wrongAnswerRepository: Repository<WrongAnswer>,
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>,
    @InjectRepository(DailyPractice)
    private dailyPracticeRepository: Repository<DailyPractice>,
  ) {}

  async submitAnswer(levelId: number, userAnswer: string, correctAnswer: string, question: string, isCorrect: boolean, points: number) {
    const today = new Date().toISOString().split('T')[0];
    
    let progress = await this.progressRepository.findOneBy({ level: { id: levelId } });
    if (!progress) {
      progress = this.progressRepository.create({ level: { id: levelId }, attempts: 0, correctAttempts: 0 });
    }
    progress.attempts++;
    if (isCorrect) {
      progress.correctAttempts++;
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }
    await this.progressRepository.save(progress);

    if (!isCorrect) {
      const wrongAnswer = this.wrongAnswerRepository.create({
        levelId,
        userAnswer,
        correctAnswer,
        question,
      });
      await this.wrongAnswerRepository.save(wrongAnswer);
    }

    let score = await this.scoreRepository.findOneBy({});
    if (!score) {
      score = this.scoreRepository.create({ totalPoints: 0, completedLevels: 0, streak: 0 });
    }
    if (isCorrect) {
      score.totalPoints += points;
      score.completedLevels += 1;
      score.streak += 1;
    } else {
      score.streak = 0;
    }
    score.lastPlayedAt = new Date();
    await this.scoreRepository.save(score);

    let dailyPractice = await this.dailyPracticeRepository.findOneBy({ date: today });
    if (!dailyPractice) {
      dailyPractice = this.dailyPracticeRepository.create({ date: today, levelsCompleted: 0, pointsEarned: 0, timeSpent: 0 });
    }
    if (isCorrect) {
      dailyPractice.levelsCompleted += 1;
      dailyPractice.pointsEarned += points;
    }
    await this.dailyPracticeRepository.save(dailyPractice);

    return { isCorrect, progress, score };
  }

  getProgress() {
    return this.progressRepository.find({ relations: ['level'] });
  }

  getWrongAnswers() {
    return this.wrongAnswerRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getScore() {
    let score = await this.scoreRepository.findOneBy({});
    if (!score) {
      score = this.scoreRepository.create({ totalPoints: 0, completedLevels: 0, streak: 0 });
      await this.scoreRepository.save(score);
    }
    return score;
  }

  getDailyPractices() {
    return this.dailyPracticeRepository.find({ order: { date: 'DESC' }, take: 30 });
  }
}
