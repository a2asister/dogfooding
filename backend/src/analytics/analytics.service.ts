import { Injectable } from '@nestjs/common';
import { ResponseService } from '../response/response.service';
import { SurveyService } from '../survey/survey.service';
import { QuestionType } from '../survey/survey.entity';

export interface QuestionStats {
  questionId: string;
  questionTitle: string;
  type: string;
  totalResponses: number;
  distribution: Record<string, number>;
  average?: number;
}

export interface SurveyAnalytics {
  surveyId: string;
  surveyTitle: string;
  totalResponses: number;
  invalidResponses: number;
  questionStats: QuestionStats[];
  responseTrend: { date: string; count: number }[];
}

@Injectable()
export class AnalyticsService {
  constructor(
    private responseService: ResponseService,
    private surveyService: SurveyService,
  ) {}

  async getSurveyAnalytics(surveyId: string): Promise<SurveyAnalytics> {
    const survey = await this.surveyService.findOne(surveyId);
    const responses = await this.responseService.findBySurvey(surveyId, true);
    
    const validResponses = responses.filter((r) => !r.isInvalid);

    const questionStats: QuestionStats[] = survey.questions.map((question) => {
      const stats: QuestionStats = {
        questionId: question.id,
        questionTitle: question.title,
        type: question.type,
        totalResponses: 0,
        distribution: {},
      };

      const answers = validResponses
        .map((r) => r.answers.find((a) => a.questionId === question.id))
        .filter((a) => a && a.value !== undefined) as any[];

      stats.totalResponses = answers.length;

      switch (question.type) {
        case QuestionType.SINGLE_CHOICE:
        case QuestionType.MULTIPLE_CHOICE:
          for (const answer of answers) {
            const values = Array.isArray(answer.value) ? answer.value : [answer.value];
            for (const val of values) {
              stats.distribution[val] = (stats.distribution[val] || 0) + 1;
            }
          }
          break;

        case QuestionType.RATING:
        case QuestionType.SCALE:
          let sum = 0;
          for (const answer of answers) {
            const val = Number(answer.value);
            sum += val;
            stats.distribution[val] = (stats.distribution[val] || 0) + 1;
          }
          stats.average = answers.length > 0 ? sum / answers.length : 0;
          break;

        case QuestionType.TEXT:
          stats.distribution = { totalAnswers: answers.length };
          break;
      }

      return stats;
    });

    const responseTrend = this.calculateResponseTrend(validResponses);

    return {
      surveyId,
      surveyTitle: survey.title,
      totalResponses: validResponses.length,
      invalidResponses: responses.filter((r) => r.isInvalid).length,
      questionStats,
      responseTrend,
    };
  }

  private calculateResponseTrend(responses: any[]): { date: string; count: number }[] {
    const trend: Record<string, number> = {};
    
    for (const response of responses) {
      const date = new Date(response.submittedAt).toISOString().split('T')[0];
      trend[date] = (trend[date] || 0) + 1;
    }

    return Object.entries(trend)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async exportResponses(surveyId: string): Promise<any[]> {
    const survey = await this.surveyService.findOne(surveyId);
    const responses = await this.responseService.findBySurvey(surveyId, false);

    return responses.map((response) => {
      const row: any = {
        responseId: response.id,
        submittedAt: response.submittedAt,
      };

      for (const question of survey.questions) {
        const answer = response.answers.find((a) => a.questionId === question.id);
        const value = answer?.value;
        row[`${question.id} - ${question.title}`] = Array.isArray(value)
          ? value.join(', ')
          : value;
      }

      return row;
    });
  }
}
