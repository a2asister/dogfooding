import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class HeartRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rate: number;

  @CreateDateColumn()
  timestamp: Date;
}
