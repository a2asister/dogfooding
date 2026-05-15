import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Survey } from '../survey/survey.entity';

export interface Answer {
  questionId: string;
  value: string | string[] | number;
}

@Entity()
export class Response {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  surveyId: string = '';

  @ManyToOne(() => Survey, (survey) => survey.responses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'surveyId' })
  survey!: Survey;

  @Column('simple-json')
  answers: Answer[] = [];

  @Column({ nullable: true })
  respondentId: string = '';

  @Column({ default: false })
  isInvalid: boolean = false;

  @Column('text', { nullable: true })
  invalidReason: string = '';

  @CreateDateColumn()
  submittedAt!: Date;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any> = {};
}
