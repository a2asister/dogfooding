import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Question } from './question.entity';
import { Response } from './response.entity';

@Entity()
export class Survey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: 'active' }) // active, paused, closed
  status: string;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ default: false })
  isPublic: boolean;

  @ManyToOne(() => User, user => user.surveys)
  creator: User;

  @OneToMany(() => Question, question => question.survey, { cascade: true })
  questions: Question[];

  @OneToMany(() => Response, response => response.survey)
  responses: Response[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}