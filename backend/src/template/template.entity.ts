import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity()
export class CardTemplate {
  @PrimaryGeneratedColumn()
  id: number = 0

  @Column()
  name: string = ''

  @Column({ nullable: true })
  description: string = ''

  @Column()
  category: string = ''

  @Column()
  background: string = ''

  @Column({ nullable: true })
  previewImage: string = ''

  @Column('simple-json', { nullable: true })
  defaultContent: {
    title: string
    message: string
  } = { title: '', message: '' }

  @Column('simple-json', { nullable: true })
  decorations: Array<{ id: number; emoji: string; x: number; y: number }> = []

  @Column({ default: true })
  isPublic: boolean = true

  @CreateDateColumn()
  createdAt: Date = new Date()
}
