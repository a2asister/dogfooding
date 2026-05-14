import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class ExportRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  filename!: string;

  @Column('simple-json')
  colors!: string[];

  @CreateDateColumn()
  createdAt!: Date;
}
