import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique, Column } from 'typeorm';
import { User } from './User';

@Entity('follows')
@Unique(['followerId', 'followingId'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.followers)
  follower: User;

  @Column()
  followerId: string;

  @ManyToOne(() => User, (user) => user.followings)
  following: User;

  @Column()
  followingId: string;

  @CreateDateColumn()
  createdAt: Date;
}
