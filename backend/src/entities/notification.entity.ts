import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory = 'system' | 'file' | 'app' | 'update' | 'security';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'info',
  })
  type!: NotificationType;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'system',
  })
  category!: NotificationCategory;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ type: 'json', nullable: true })
  actionData?: {
    actionType: string;
    payload: any;
  };

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  readAt?: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user!: User;
}
