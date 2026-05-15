import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { DataPoint } from './data-point.entity';

@Entity()
export class DataSeries {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  formula?: string;

  @Column({ type: 'json', nullable: true })
  parameters?: Record<string, number>;

  @Column({ default: false })
  isDeleted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => DataPoint, (point) => point.series, { cascade: true })
  points!: DataPoint[];
}
