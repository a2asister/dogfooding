import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Note } from './Note';
import { Product } from './Product';
import { User } from './User';

@Entity('note_products')
export class NoteProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Note)
  note: Note;

  @Column()
  noteId: string;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => User)
  creator: User;

  @Column()
  creatorId: string;

  @Column({ default: 0 })
  sort: number;

  @Column({ type: 'text', nullable: true })
  recommendation: string;

  @Column({ default: 0 })
  clickCount: number;

  @Column({ default: 0 })
  conversionCount: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
