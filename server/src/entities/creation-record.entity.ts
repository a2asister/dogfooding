import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('creation_records')
export class CreationRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'work_id' })
  workId!: number;

  @Column()
  action!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
