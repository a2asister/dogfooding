import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Response } from '../response/response.entity';

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

@Entity()
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title: string = '';

  @Column('text', { nullable: true })
  description: string = '';

  @Column('simple-json')
  questions: Question[] = [];

  @Column({ default: false })
  isPublished: boolean = false;

  @Column({ default: false })
  requireAuth: boolean = false;

  @Column({ nullable: true })
  createdBy: string = '';

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Response, (response) => response.survey)
  responses!: Response[];
}
