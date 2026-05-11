import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column('varchar', { length: 100 })
  author: string;

  @Column('varchar', { length: 36, nullable: true })
  parentId: string | null;

  @Column('text', { nullable: true })
  path: string | null;

  @Column('int', { default: 0 })
  depth: number;

  @Column('int', { default: 0 })
  likes: number;

  @Column('boolean', { default: false })
  isLiked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
