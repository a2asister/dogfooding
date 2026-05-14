import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm'
import { Card } from '../card/card.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number = 0

  @Column({ unique: true })
  username: string = ''

  @Column()
  password: string = ''

  @Column({ nullable: true })
  nickname: string = ''

  @CreateDateColumn()
  createdAt: Date = new Date()

  @OneToMany(() => Card, card => card.sender)
  sentCards: Card[] = []

  @OneToMany(() => Card, card => card.receiver)
  receivedCards: Card[] = []
}
