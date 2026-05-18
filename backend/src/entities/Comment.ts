import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Note } from './Note';
import { CommentLike } from './CommentLike';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  replyCount: number;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true })
  deleteReason: string;

  @ManyToOne(() => Note, (note) => note.comments)
  note: Note;

  @Column()
  noteId: string;

  @ManyToOne(() => User, (user) => user.comments)
  author: User;

  @Column()
  authorId: string;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Comment;

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => Comment, (comment) => comment.children, { nullable: true })
  @JoinColumn({ name: 'rootId' })
  root: Comment;

  @Column({ nullable: true })
  rootId: string;

  @ManyToOne(() => User, { nullable: true })
  replyToUser: User;

  @Column({ nullable: true })
  replyToUserId: string;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @OneToMany(() => Comment, (comment) => comment.root)
  children: Comment[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.comment)
  likes: CommentLike[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
