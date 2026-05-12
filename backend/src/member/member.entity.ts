import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm'
import { ObjectType, Field, ID } from '@nestjs/graphql'

@ObjectType()
@Entity()
export class Member {
  @Field(() => ID)
  @PrimaryColumn()
  id: string

  @Field()
  @Column()
  name: string

  @Field()
  @Column()
  email: string

  @Field()
  @Column()
  password: string

  @Field()
  @Column()
  avatar: string

  @Field()
  @Column()
  role: string

  @Field()
  @Column('text')
  bio: string

  @Field()
  @Column({ default: false })
  isOnline: boolean

  @Field()
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  lastSeen: Date

  @CreateDateColumn()
  createdAt: Date
}
