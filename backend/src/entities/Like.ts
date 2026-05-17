import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from './User';
import { Note } from './Note';

@Entity('likes')
@Unique(['userId', 'noteId'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.likes)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Note, (note) => note.likes)
  note: Note;

  @Column()
  noteId: string;

  @CreateDateColumn()
  createdAt: Date;
}
