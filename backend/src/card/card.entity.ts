import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../user/user.entity'

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number = 0

  @Column()
  title: string = ''

  @Column('text')
  message: string = ''

  @Column()
  senderName: string = ''

  @Column()
  receiverName: string = ''

  @Column()
  background: string = ''

  @Column({ nullable: true })
  music: string = ''

  @Column('simple-json', { nullable: true })
  decorations: Array<{ id: number; emoji: string; x: number; y: number }> = []

  @Column({ default: false })
  isReceived: boolean = false

  @Column({ nullable: true })
  shareCode: string = ''

  @ManyToOne(() => User, user => user.sentCards, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'senderId' })
  sender: User | null = null

  @Column({ nullable: true })
  senderId: number | null = null

  @ManyToOne(() => User, user => user.receivedCards, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'receiverId' })
  receiver: User | null = null

  @Column({ nullable: true })
  receiverId: number | null = null

  @CreateDateColumn()
  createdAt: Date = new Date()

  @Column({ nullable: true })
  receivedAt: Date | null = null
}
