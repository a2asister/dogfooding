import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Floor } from './floor.entity';
import { HouseType } from './house-type.entity';

@ObjectType()
@Entity()
export class House {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  houseNumber: string;

  @Field()
  @Column()
  floorId: number;

  @Field(() => Floor)
  @ManyToOne(() => Floor, floor => floor.houses)
  floor: Floor;

  @Field()
  @Column()
  houseTypeId: number;

  @Field(() => HouseType)
  @ManyToOne(() => HouseType, houseType => houseType.houses)
  houseType: HouseType;

  @Field(() => Float)
  @Column('real')
  price: number;

  @Field()
  @Column({ default: 'available' })
  status: string;

  @Field()
  @Column({ default: '' })
  orientation: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
