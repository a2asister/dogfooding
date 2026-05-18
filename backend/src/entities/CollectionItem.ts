import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { Collection } from './Collection';
import { Note } from './Note';

@Entity('collection_items')
@Unique(['collectionId', 'noteId'])
export class CollectionItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Collection, (collection) => collection.items)
  collection: Collection;

  @Column()
  collectionId: string;

  @ManyToOne(() => Note)
  note: Note;

  @Column()
  noteId: string;

  @CreateDateColumn()
  createdAt: Date;
}
