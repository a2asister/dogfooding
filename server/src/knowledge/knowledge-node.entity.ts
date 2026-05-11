import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity()
export class KnowledgeNode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  parentId: number;

  @Column({ default: false })
  isLearned: boolean;

  @Column({ default: 0 })
  orderIndex: number;

  @ManyToOne(() => KnowledgeNode, node => node.children)
  @JoinColumn({ name: 'parentId' })
  parent: KnowledgeNode;

  @OneToMany(() => KnowledgeNode, node => node.parent)
  children: KnowledgeNode[];
}
