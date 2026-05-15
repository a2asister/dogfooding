import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey, QuestionType, Question } from './survey.entity';
import { CreateSurveyDto, UpdateSurveyDto } from './dto/create-survey.dto';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
  ) {}

  private validateQuestion(question: Question): void {
    if (!question.title.trim()) {
      throw new BadRequestException('Question title cannot be empty');
    }

    if (
      (question.type === QuestionType.SINGLE_CHOICE || question.type === QuestionType.MULTIPLE_CHOICE) &&
      (!question.options || question.options.length < 2)
    ) {
      throw new BadRequestException('Choice questions require at least 2 options');
    }

    if (question.type === QuestionType.RATING || question.type === QuestionType.SCALE) {
      if (question.minRating === undefined || question.maxRating === undefined) {
        throw new BadRequestException('Rating questions require min and max values');
      }
      if (question.minRating >= question.maxRating) {
        throw new BadRequestException('minRating must be less than maxRating');
      }
    }
  }

  async create(createSurveyDto: CreateSurveyDto, userId?: string): Promise<Survey> {
    for (const question of createSurveyDto.questions) {
      this.validateQuestion(question);
    }

    const survey = this.surveyRepository.create({
      ...createSurveyDto,
      createdBy: userId,
    });

    return this.surveyRepository.save(survey);
  }

  async findAll(userId?: string): Promise<Survey[]> {
    const where = userId ? { createdBy: userId } : {};
    return this.surveyRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Survey> {
    const survey = await this.surveyRepository.findOne({ where: { id } });
    if (!survey) {
      throw new NotFoundException('Survey not found');
    }
    return survey;
  }

  async findPublished(id: string): Promise<Survey> {
    const survey = await this.findOne(id);
    if (!survey.isPublished) {
      throw new NotFoundException('Survey is not published');
    }
    return survey;
  }

  async update(id: string, updateSurveyDto: UpdateSurveyDto): Promise<Survey> {
    const survey = await this.findOne(id);

    if (updateSurveyDto.questions) {
      for (const question of updateSurveyDto.questions) {
        this.validateQuestion(question);
      }
    }

    Object.assign(survey, updateSurveyDto);
    return this.surveyRepository.save(survey);
  }

  async remove(id: string): Promise<void> {
    const result = await this.surveyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Survey not found');
    }
  }

  async publish(id: string): Promise<Survey> {
    const survey = await this.findOne(id);
    if (survey.questions.length === 0) {
      throw new BadRequestException('Cannot publish survey with no questions');
    }
    survey.isPublished = true;
    return this.surveyRepository.save(survey);
  }

  async unpublish(id: string): Promise<Survey> {
    const survey = await this.findOne(id);
    survey.isPublished = false;
    return this.surveyRepository.save(survey);
  }
}
