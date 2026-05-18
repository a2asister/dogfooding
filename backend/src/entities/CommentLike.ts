import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from './User';
import { Comment } from './Comment';

@Entity('comment_likes')
@Unique(['userId', 'commentId'])
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.commentLikes)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Comment, (comment) => comment.likes)
  comment: Comment;

  @Column()
  commentId: string;

  @CreateDateColumn()
  createdAt: Date;
}
