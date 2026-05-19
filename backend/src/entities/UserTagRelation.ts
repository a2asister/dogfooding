import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { UserTag } from './UserTag';

@Entity('user_tag_relations')
export class UserTagRelation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => UserTag, (tag) => tag.userRelations)
  tag: UserTag;

  @Column()
  tagId: string;

  @Column({ type: 'float', default: 1.0 })
  weight: number;

  @Column({ default: 0 })
  hitCount: number;

  @Column({ type: 'simple-json', nullable: true })
  source: {
    type: 'browse' | 'search' | 'like' | 'comment' | 'favorite' | 'follow';
    noteId?: string;
    topicId?: string;
    keyword?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  lastHitAt: Date;
}
