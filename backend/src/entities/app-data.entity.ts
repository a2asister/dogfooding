import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class AppData {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  appType!: 'notepad' | 'calculator' | 'browser';

  @Column({ type: 'text', nullable: true })
  content!: string | null;

  @Column({ type: 'json', nullable: true })
  metadata!: any;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title!: string | null;

  @Column()
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
