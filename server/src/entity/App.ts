import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class App {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 20 })
  env: string;

  @Column({ length: 20 })
  type: string;

  @Column({ length: 50, nullable: true })
  version: string;

  @Column({ type: 'int', default: 1 })
  instanceCount: number;

  @Column({ length: 20, default: 'running' })
  status: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
