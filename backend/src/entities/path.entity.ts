import { Entity, Column, OneToMany, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PointEntity } from './point.entity';
import { PathVersionEntity } from './path-version.entity';

@Entity('paths')
export class PathEntity {
  @PrimaryColumn()
  id: string;

  @Column({ default: '新建路径' })
  name: string;

  @OneToMany(() => PointEntity, (point) => point.path, { cascade: true })
  points: PointEntity[];

  @OneToMany(() => PathVersionEntity, (version) => version.path, { cascade: true })
  versions: PathVersionEntity[];

  @CreateDateColumn()
  createdAt: number;

  @UpdateDateColumn()
  updatedAt: number;
}