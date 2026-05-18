import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  REPLY = 'reply',
  FOLLOW = 'follow',
  FAVORITE = 'favorite',
  SYSTEM = 'system',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'simple-enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'simple-json', nullable: true })
  extra: Record<string, any>;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  fromUser: User;

  @Column({ nullable: true })
  fromUserId: string;

  @CreateDateColumn()
  createdAt: Date;
}
