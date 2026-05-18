import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany } from 'typeorm';
import { Note } from './Note';
import { TopicFollow } from './TopicFollow';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  cover: string;

  @Column({ default: 0 })
  noteCount: number;

  @Column({ default: 0 })
  followCount: number;

  @Column({ default: false })
  isHot: boolean;

  @Column({ default: 0 })
  sort: number;

  @Column({ nullable: true })
  category: string;

  @ManyToMany(() => Note, (note) => note.topics)
  notes: Note[];

  @OneToMany(() => TopicFollow, (follow) => follow.topic)
  follows: TopicFollow[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
