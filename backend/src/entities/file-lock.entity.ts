import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class FileLock {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  fileId!: number;

  @Column()
  userId!: number;

  @Column({ type: 'varchar', length: 100 })
  operation!: string;

  @Column({ type: 'datetime' })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
