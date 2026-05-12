import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Medicine } from './medicine.entity';

@Entity()
export class MedicineRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Medicine, medicine => medicine.records)
  medicine: Medicine;

  @Column()
  medicineId: number;

  @Column()
  scheduledTime: string;

  @Column({ default: false })
  taken: boolean;

  @Column({ nullable: true })
  takenAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
