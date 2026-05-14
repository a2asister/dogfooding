import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Level } from './Level';

@Entity()
export class Progress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Level, level => level.progresses)
  level: Level;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: 0 })
  attempts: number;

  @Column({ default: 0 })
  correctAttempts: number;

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
