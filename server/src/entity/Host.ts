import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Host {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  hostname: string;

  @Column({ length: 50, unique: true })
  ip: string;

  @Column({ length: 20 })
  env: string;

  @Column({ type: 'int', default: 1 })
  cpuCores: number;

  @Column({ type: 'float', default: 0 })
  memoryTotal: number;

  @Column({ type: 'float', default: 0 })
  diskTotal: number;

  @Column({ length: 20, default: 'online' })
  status: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
