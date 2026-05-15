export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TEXT = 'text',
  RATING = 'rating',
  SCALE = 'scale',
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
  options?: string[];
  minRating?: number;
  maxRating?: number;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  isPublished: boolean;
  requireAuth: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  questionId: string;
  value: string | string[] | number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Answer[];
  respondentId?: string;
  isInvalid: boolean;
  invalidReason?: string;
  submittedAt: string;
  metadata?: Record<string, any>;
}

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
