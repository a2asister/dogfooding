import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CodeSnippet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  code: string;

  @Column()
  language: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
