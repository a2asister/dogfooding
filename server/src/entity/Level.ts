import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Progress } from './Progress';

@Entity()
export class Level {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  difficulty: number;

  @Column('simple-json')
  question: {
    type: string;
    content: string;
    options?: string[];
    answer: string;
    hints?: string[];
  };

  @Column({ default: 10 })
  points: number;

  @Column({ default: false })
  isUnlocked: boolean;

  @OneToMany(() => Progress, progress => progress.level)
  progresses: Progress[];
}
