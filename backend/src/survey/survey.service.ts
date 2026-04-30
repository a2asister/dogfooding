import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from './survey.entity';
import { Response } from './response.entity';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
    @InjectRepository(Response)
    private responseRepository: Repository<Response>,
  ) {}

  async create(survey: Partial<Survey>): Promise<Survey> {
    return this.surveyRepository.save(survey);
  }

  async findAll(): Promise<Survey[]> {
    return this.surveyRepository.find({ relations: ['questions', 'questions.options'] });
  }

  async findById(id: number): Promise<Survey | undefined> {
    return this.surveyRepository.findOne({ 
      where: { id },
      relations: ['questions', 'questions.options'] 
    });
  }

  async update(id: number, survey: Partial<Survey>): Promise<Survey | undefined> {
    const existingSurvey = await this.findById(id);
    if (!existingSurvey) {
      return undefined;
    }
    const updatedSurvey = this.surveyRepository.create({
      ...existingSurvey,
      ...survey,
      id: existingSurvey.id,
    });
    return this.surveyRepository.save(updatedSurvey);
  }

  async delete(id: number): Promise<void> {
    await this.surveyRepository.delete(id);
  }

  async submitResponse(response: Partial<Response>): Promise<Response> {
    return this.responseRepository.save(response);
  }

  async getResponses(surveyId: number): Promise<Response[]> {
    return this.responseRepository.find({ 
      where: { survey: { id: surveyId } },
      relations: ['answers', 'answers.question'] 
    });
  }

  async getSurveyStatistics(surveyId: number): Promise<any> {
    const survey = await this.findById(surveyId);
    const responses = await this.getResponses(surveyId);

    const statistics = survey.questions.map(question => {
      const questionResponses = responses.map(response => 
        response.answers.find(answer => answer.question.id === question.id)
      ).filter(Boolean);

      if (question.type === 'multiple_choice' || question.type === 'single_choice') {
        const optionCounts = {};
        question.options.forEach(option => {
          optionCounts[option.id] = 0;
        });

        questionResponses.forEach(answer => {
          if (answer.optionIds) {
            answer.optionIds.forEach(optionId => {
              if (optionCounts[optionId] !== undefined) {
                optionCounts[optionId]++;
              }
            });
          }
        });

        return {
          questionId: question.id,
          questionText: question.text,
          type: question.type,
          statistics: optionCounts,
        };
      } else {
        return {
          questionId: question.id,
          questionText: question.text,
          type: question.type,
          responseCount: questionResponses.length,
        };
      }
    });

    return {
      surveyId,
      totalResponses: responses.length,
      statistics,
    };
  }
}