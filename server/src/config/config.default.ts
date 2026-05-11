import { MidwayConfig } from '@midwayjs/core';
import { Question } from '../entity/question.entity';
import { Answer } from '../entity/answer.entity';
import { join } from 'path';

export default {
  keys: 'quiz-system',
  koa: {
    port: 18089,
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'better-sqlite3',
        database: join(__dirname, '../../data/quiz.db'),
        synchronize: true,
        logging: false,
        entities: [Question, Answer],
      },
    },
  },
  cors: {
    credentials: true,
  },
  midwayLogger: {
    default: {
      dir: join(__dirname, '../../logs'),
    },
  },
} as MidwayConfig;
