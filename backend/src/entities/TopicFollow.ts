import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from './User';
import { Topic } from './Topic';

@Entity('topic_follows')
@Unique(['userId', 'topicId'])
export class TopicFollow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.topicFollows)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Topic, (topic) => topic.follows)
  topic: Topic;

  @Column()
  topicId: string;

  @CreateDateColumn()
  createdAt: Date;
}
