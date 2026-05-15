import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response, Answer } from './response.entity';
import { CreateResponseDto } from './dto/create-response.dto';
import { SurveyService } from '../survey/survey.service';
import { QuestionType } from '../survey/survey.entity';

@Injectable()
export class ResponseService {
  constructor(
    @InjectRepository(Response)
    private responseRepository: Repository<Response>,
    private surveyService: SurveyService,
  ) {}

  private validateAnswer(answer: Answer, question: any): void {
    const isEmpty = 
      answer.value === undefined || 
      answer.value === null || 
      answer.value === '' ||
      (Array.isArray(answer.value) && answer.value.length === 0);
    
    if (question.required && isEmpty) {
      throw new BadRequestException(`Question "${question.title}" is required`);
    }

    if (isEmpty) return;

    switch (question.type) {
      case QuestionType.SINGLE_CHOICE:
        if (typeof answer.value !== 'string' || !question.options.includes(answer.value)) {
          throw new BadRequestException(`Invalid answer for question "${question.title}"`);
        }
        break;
      case QuestionType.MULTIPLE_CHOICE:
        if (!Array.isArray(answer.value)) {
          throw new BadRequestException(`Invalid answer format for question "${question.title}"`);
        }
        for (const val of answer.value) {
          if (!question.options.includes(val)) {
            throw new BadRequestException(`Invalid option "${val}" for question "${question.title}"`);
          }
        }
        break;
      case QuestionType.RATING:
      case QuestionType.SCALE:
        const numValue = Number(answer.value);
        if (isNaN(numValue) || numValue < question.minRating || numValue > question.maxRating) {
          throw new BadRequestException(
            `Answer for question "${question.title}" must be between ${question.minRating} and ${question.maxRating}`,
          );
        }
        break;
    }
  }

  private detectInvalidResponse(answers: Answer[], questions: any[]): { isInvalid: boolean; reason?: string } {
    const answerTimes = answers.map((_, i) => Date.now() + i * 100);
    const avgTimePerQuestion = (answerTimes[answerTimes.length - 1] - answerTimes[0]) / answers.length;
    
    if (avgTimePerQuestion < 500 && answers.length > 3) {
      return { isInvalid: true, reason: 'Response submitted too quickly' };
    }

    const duplicatePatterns = answers.filter((a, i) => 
      i > 0 && JSON.stringify(a.value) === JSON.stringify(answers[i - 1].value)
    ).length;
    
    if (duplicatePatterns > answers.length * 0.6 && answers.length > 4) {
      return { isInvalid: true, reason: 'Patterned response detected' };
    }

    return { isInvalid: false };
  }

  async create(createResponseDto: CreateResponseDto): Promise<Response> {
    const survey = await this.surveyService.findPublished(createResponseDto.surveyId);

    for (const question of survey.questions) {
      const answer = createResponseDto.answers.find((a) => a.questionId === question.id);
      if (!answer && question.required) {
        throw new BadRequestException(`Missing answer for required question: "${question.title}"`);
      }
      if (answer) {
        this.validateAnswer(answer, question);
      }
    }

    const invalidCheck = this.detectInvalidResponse(createResponseDto.answers, survey.questions);

    const response = this.responseRepository.create({
      ...createResponseDto,
      isInvalid: invalidCheck.isInvalid,
      invalidReason: invalidCheck.reason,
    });

    return this.responseRepository.save(response);
  }

  async findBySurvey(surveyId: string, includeInvalid = false): Promise<Response[]> {
    const where: any = { surveyId };
    if (!includeInvalid) {
      where.isInvalid = false;
    }
    return this.responseRepository.find({
      where,
      order: { submittedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Response> {
    const response = await this.responseRepository.findOne({ 
      where: { id },
      relations: ['survey'],
    });
    if (!response) {
      throw new BadRequestException('Response not found');
    }
    return response;
  }

  async markInvalid(id: string, reason: string): Promise<Response> {
    const response = await this.findOne(id);
    response.isInvalid = true;
    response.invalidReason = reason;
    return this.responseRepository.save(response);
  }
}
