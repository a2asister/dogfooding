import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from './User';
import { Message } from './Message';

@Entity('conversations')
@Index(['user1Id', 'user2Id'], { unique: true })
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user1: User;

  @Column()
  user1Id: string;

  @ManyToOne(() => User)
  user2: User;

  @Column()
  user2Id: string;

  @ManyToOne(() => Message, { nullable: true })
  lastMessage: Message;

  @Column({ nullable: true })
  lastMessageId: string;

  @Column({ type: 'text', nullable: true })
  lastMessagePreview: string;

  @Column({ default: 0 })
  unreadCountUser1: number;

  @Column({ default: 0 })
  unreadCountUser2: number;

  @Column({ default: false })
  isDeletedByUser1: boolean;

  @Column({ default: false })
  isDeletedByUser2: boolean;

  @Column({ default: false })
  isBlockedByUser1: boolean;

  @Column({ default: false })
  isBlockedByUser2: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
