import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from './User';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  LINK = 'link',
  SYSTEM = 'system',
  NOTE_SHARE = 'note_share',
  PRODUCT_SHARE = 'product_share',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  RECALLED = 'recalled',
}

@Entity('messages')
@Index(['conversationId', 'createdAt'])
@Index(['senderId', 'createdAt'])
@Index(['receiverId', 'createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  conversationId: string;

  @ManyToOne(() => User)
  sender: User;

  @Column()
  senderId: string;

  @ManyToOne(() => User)
  receiver: User;

  @Column()
  receiverId: string;

  @Column({
    type: 'simple-enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: {
    imageUrl?: string;
    linkUrl?: string;
    linkTitle?: string;
    linkImage?: string;
    noteId?: string;
    noteTitle?: string;
    productId?: string;
    productTitle?: string;
  };

  @Column({
    type: 'simple-enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @Column({ default: false })
  isDeletedBySender: boolean;

  @Column({ default: false })
  isDeletedByReceiver: boolean;

  @Column({ nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
