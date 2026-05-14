import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  totalPoints: number;

  @Column({ default: 0 })
  completedLevels: number;

  @Column({ default: 0 })
  streak: number;

  @CreateDateColumn()
  lastPlayedAt: Date;
}
