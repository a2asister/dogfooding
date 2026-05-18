import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from './User';
import { Note } from './Note';

@Entity('dislikes')
@Unique(['userId', 'noteId'])
export class Dislike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.dislikes)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Note, (note) => note.dislikes)
  note: Note;

  @Column()
  noteId: string;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
