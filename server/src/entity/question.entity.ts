import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'simple-array' })
  options: string[];

  @Column({ type: 'int' })
  answer: number;

  @Column({ type: 'text' })
  explanation: string;
}
