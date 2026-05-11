import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  userId: string;

  @Column({ type: 'int' })
  questionId: number;

  @Column({ type: 'boolean' })
  isCorrect: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
