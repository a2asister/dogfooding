import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { DataSeries } from './data-series.entity';

@Entity()
export class DataPoint {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('double')
  x!: number;

  @Column('double')
  y!: number;

  @Column({ default: false })
  isInflection!: boolean;

  @Column({ default: false })
  isPeak!: boolean;

  @Column({ default: false })
  isOutlier!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => DataSeries, (series) => series.points)
  series!: DataSeries;
}
