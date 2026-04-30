import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Survey } from './survey.entity';
import { Option } from './option.entity';
import { Answer } from './answer.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  type: string; // multiple_choice, single_choice, text, rating

  @Column({ default: false })
  required: boolean;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => Survey, survey => survey.questions)
  survey: Survey;

  @OneToMany(() => Option, option => option.question, { cascade: true })
  options: Option[];

  @OneToMany(() => Answer, answer => answer.question)
  answers: Answer[];
}