import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from './User';

@Entity('blacklists')
@Unique(['userId', 'blockedUserId'])
export class Blacklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.blacklists)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  blockedUser: User;

  @Column()
  blockedUserId: string;

  @CreateDateColumn()
  createdAt: Date;
}
