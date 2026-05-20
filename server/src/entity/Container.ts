import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Container {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  containerId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  image: string;

  @Column({ type: 'int' })
  hostId: number;

  @Column({ length: 20 })
  env: string;

  @Column({ type: 'float', default: 0 })
  cpuLimit: number;

  @Column({ type: 'float', default: 0 })
  memoryLimit: number;

  @Column({ length: 20, default: 'running' })
  status: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
