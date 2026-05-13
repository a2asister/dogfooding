import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Building } from './building.entity';
import { House } from './house.entity';

@ObjectType()
@Entity()
export class Floor {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  floorNumber: number;

  @Field()
  @Column()
  buildingId: number;

  @Field(() => Building)
  @ManyToOne(() => Building, building => building.floors)
  building: Building;

  @Field(() => [House])
  @OneToMany(() => House, house => house.floor)
  houses: House[];

  @Field()
  @Column({ default: true })
  isActive: boolean;
}
