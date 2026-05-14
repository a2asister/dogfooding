import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class WrongAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  levelId: number;

  @Column('text')
  userAnswer: string;

  @Column('text')
  correctAnswer: string;

  @Column('text')
  question: string;

  @CreateDateColumn()
  createdAt: Date;
}
