import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum BillType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum BillCategory {
  FOOD = 'food',
  TRANSPORT = 'transport',
  SHOPPING = 'shopping',
  ENTERTAINMENT = 'entertainment',
  SALARY = 'salary',
  BONUS = 'bonus',
  OTHER = 'other',
}

@Entity()
export class Bill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'simple-enum',
    enum: BillType,
  })
  type: BillType;

  @Column({
    type: 'simple-enum',
    enum: BillCategory,
  })
  category: BillCategory;

  @Column({ type: 'datetime' })
  date: Date;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
