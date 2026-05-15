import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  progress: number;

  @Column({ default: 1 })
  weight: number;

  @Column({ nullable: true })
  deadline: Date;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: false })
  isOverdue: boolean;

  @Column({ nullable: true })
  parentId: number;

  @Column({ default: 0 })
  level: number;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isExpanded: boolean;

  @Column({ type: 'simple-json', nullable: true })
  metadata: any;

  @ManyToOne(() => Task, task => task.children, { onDelete: 'CASCADE' })
  parent: Task;

  @OneToMany(() => Task, task => task.parent)
  children: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
