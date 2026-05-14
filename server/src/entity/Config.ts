import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity()
export class Config {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column()
  category!: string

  @Column('simple-json')
  config!: {
    density: number
    speed: number
    lightIntensity: number
    hazeIntensity: number
    particleSize: number
    mouseInfluence: number
  }

  @CreateDateColumn()
  createdAt!: Date
}
