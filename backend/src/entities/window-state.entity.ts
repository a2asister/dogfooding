import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class WindowState {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  windowId!: string;

  @Column()
  title!: string;

  @Column({ type: 'varchar', length: 50 })
  type!: string;

  @Column({ type: 'int', default: 100 })
  x!: number;

  @Column({ type: 'int', default: 100 })
  y!: number;

  @Column({ type: 'int', default: 800 })
  width!: number;

  @Column({ type: 'int', default: 600 })
  height!: number;

  @Column({ default: false })
  isMinimized!: boolean;

  @Column({ default: false })
  isMaximized!: boolean;

  @Column({ type: 'int', default: 0 })
  zIndex!: number;

  @Column({ type: 'json', nullable: true })
  data!: any;

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
