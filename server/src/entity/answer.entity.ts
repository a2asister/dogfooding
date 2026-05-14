import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Assessment } from './assessment.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  questionId: number;

  @Column()
  answer: string;

  @Column('int')
  score: number;

  @ManyToOne(() => Assessment, (assessment) => assessment.answers)
  assessment: Assessment;

  @Column()
  assessmentId: string;
}
