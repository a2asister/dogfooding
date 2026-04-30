import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Survey } from './survey.entity';
import { Answer } from './answer.entity';

@Entity()
export class Response {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  respondentId: string;

  @Column({ nullable: true })
  respondentEmail: string;

  @ManyToOne(() => Survey, survey => survey.responses)
  survey: Survey;

  @OneToMany(() => Answer, answer => answer.response, { cascade: true })
  answers: Answer[];

  @CreateDateColumn()
  submittedAt: Date;
}