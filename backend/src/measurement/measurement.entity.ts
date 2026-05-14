import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Measurement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  value: number;

  @Column()
  unit: string;

  @Column()
  label: string;

  @CreateDateColumn()
  createdAt: Date;
}
