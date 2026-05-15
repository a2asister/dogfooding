import { Entity, Column, ManyToOne, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { PathEntity } from './path.entity';

@Entity('path_versions')
export class PathVersionEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  pathId: string;

  @Column('int')
  versionNumber: number;

  @Column('simple-json')
  data: {
    id: string;
    name: string;
    points: Array<{ id: string; x: number; y: number; isControl?: boolean }>;
    createdAt: number;
    updatedAt: number;
  };

  @Column()
  description: string;

  @ManyToOne(() => PathEntity, (path) => path.versions, { onDelete: 'CASCADE' })
  path: PathEntity;

  @CreateDateColumn()
  createdAt: number;
}