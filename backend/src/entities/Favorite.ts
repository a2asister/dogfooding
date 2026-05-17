import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique, Column } from 'typeorm';
import { User } from './User';
import { Note } from './Note';

@Entity('favorites')
@Unique(['userId', 'noteId'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.favorites)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Note, (note) => note.favorites)
  note: Note;

  @Column()
  noteId: string;

  @CreateDateColumn()
  createdAt: Date;
}
