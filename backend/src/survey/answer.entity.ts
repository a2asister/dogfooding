import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Question } from './question.entity';
import { Response } from './response.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  textAnswer: string;

  @ManyToOne(() => Question, question => question.answers)
  question: Question;

  @ManyToOne(() => Response, response => response.answers)
  response: Response;

  @Column({ type: 'simple-array', nullable: true })
  optionIds: number[];
}