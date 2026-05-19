import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './User';
import { Topic } from './Topic';
import { Like } from './Like';
import { Favorite } from './Favorite';
import { Comment } from './Comment';
import { Dislike } from './Dislike';

export enum NoteStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  TAKEN_DOWN = 'taken_down',
}

export enum NotePermission {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FOLLOWERS_ONLY = 'followers_only',
}

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'simple-json', nullable: true })
  images: string[];

  @Column({ nullable: true })
  location: string;

  @Column({
    type: 'simple-enum',
    enum: NoteStatus,
    default: NoteStatus.DRAFT,
  })
  status: NoteStatus;

  @Column({
    type: 'simple-enum',
    enum: NotePermission,
    default: NotePermission.PUBLIC,
  })
  permission: NotePermission;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  favoriteCount: number;

  @Column({ default: 0 })
  shareCount: number;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ type: 'float', default: 0 })
  hotScore: number;

  @Column({ default: false })
  isDeleted: boolean;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @Column({ type: 'simple-json', nullable: true })
  locationInfo: {
    lat: number;
    lng: number;
    address: string;
    city: string;
  };

  @Column({ nullable: true })
  rejectReason: string;

  @ManyToOne(() => User, (user) => user.notes)
  author: User;

  @Column()
  authorId: string;

  @ManyToMany(() => Topic, (topic) => topic.notes)
  @JoinTable({
    name: 'note_topics',
    joinColumn: { name: 'note_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'topic_id', referencedColumnName: 'id' },
  })
  topics: Topic[];

  @OneToMany(() => Like, (like) => like.note)
  likes: Like[];

  @OneToMany(() => Favorite, (favorite) => favorite.note)
  favorites: Favorite[];

  @OneToMany(() => Comment, (comment) => comment.note)
  comments: Comment[];

  @OneToMany(() => Dislike, (dislike) => dislike.note)
  dislikes: Dislike[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
