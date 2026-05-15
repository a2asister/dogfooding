import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class FileItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  content!: string | null;

  @Column()
  type!: 'folder' | 'file';

  @Column({ type: 'integer', nullable: true })
  parentId!: number | null;

  @Column()
  userId!: number;

  @Column({ default: false })
  isDeleted!: boolean;

  @Column({ type: 'text', nullable: true })
  originalPath!: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedAt!: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mimeType!: string | null;

  @Column({ type: 'bigint', default: 0 })
  size!: number;
}