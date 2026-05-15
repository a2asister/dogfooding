import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { PathEntity } from './path.entity';

@Entity('points')
export class PointEntity {
  @PrimaryColumn()
  id: string;

  @Column('float')
  x: number;

  @Column('float')
  y: number;

  @Column({ default: false })
  isControl?: boolean;

  @Column()
  order: number;

  @Column()
  pathId: string;

  @ManyToOne(() => PathEntity, (path) => path.points, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pathId' })
  path: PathEntity;
}