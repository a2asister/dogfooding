import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('text')
  pageStructure!: string;

  @Column('text')
  animationConfig!: string;

  @Column('text')
  responsiveConfig!: string;

  @Column({ default: 0 })
  scrollCalibration!: number;

  @Column({ default: false })
  isAutoSave!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
