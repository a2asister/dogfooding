import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity()
export class EquationRecord {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  equation!: string

  @Column()
  balancedEquation!: string

  @Column({ default: true })
  isCorrect!: boolean

  @Column({ default: 1 })
  attempts!: number

  @Column({ default: 0 })
  timeSpent!: number

  @CreateDateColumn()
  createdAt!: Date
}
