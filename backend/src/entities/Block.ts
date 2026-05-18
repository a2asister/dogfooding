import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from './User';
import { Topic } from './Topic';

export enum BlockType {
  USER = 'user',
  TOPIC = 'topic',
}

@Entity('blocks')
@Unique(['userId', 'blockType', 'blockId'])
export class Block {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'simple-enum',
    enum: BlockType,
  })
  blockType: BlockType;

  @Column()
  blockId: string;

  @ManyToOne(() => User, (user) => user.blocks)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  blockedUser: User;

  @ManyToOne(() => Topic, { nullable: true })
  blockedTopic: Topic;

  @CreateDateColumn()
  createdAt: Date;
}
