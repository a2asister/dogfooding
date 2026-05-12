import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MedicineRecord } from './medicine-record.entity';

@Entity()
export class Medicine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column()
  dosage: string;

  @Column()
  time: string;

  @Column('text')
  description: string;

  @Column('text')
  precautions: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => MedicineRecord, record => record.medicine)
  records: MedicineRecord[];
}
