import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Element } from './element.entity';
import { KnowledgeCategory } from './knowledge-category.entity';

@Entity()
export class Note {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: string;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => Element, (element) => element.notes, { nullable: true })
  element?: Element;

  @Column({ nullable: true })
  elementId?: number;

  @ManyToOne(() => KnowledgeCategory, (category) => category.notes, { nullable: true })
  category?: KnowledgeCategory;

  @Column({ nullable: true })
  categoryId?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
