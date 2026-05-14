import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class DailyPractice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column({ default: 0 })
  levelsCompleted: number;

  @Column({ default: 0 })
  pointsEarned: number;

  @Column({ default: 0 })
  timeSpent: number;

  @CreateDateColumn()
  createdAt: Date;
}
