import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { House } from './house.entity';

@ObjectType()
@Entity()
export class HouseType {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field(() => Float)
  @Column('real')
  area: number;

  @Field()
  @Column()
  bedrooms: number;

  @Field()
  @Column()
  livingRooms: number;

  @Field()
  @Column()
  bathrooms: number;

  @Field()
  @Column({ default: '' })
  floorPlanUrl: string;

  @Field(() => [House])
  @OneToMany(() => House, house => house.houseType)
  houses: House[];

  @Field()
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
