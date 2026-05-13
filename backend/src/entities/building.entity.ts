import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Floor } from './floor.entity';

@ObjectType()
@Entity()
export class Building {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  address: string;

  @Field(() => Float)
  @Column('real')
  latitude: number;

  @Field(() => Float)
  @Column('real')
  longitude: number;

  @Field()
  @Column()
  totalFloors: number;

  @Field(() => [Floor])
  @OneToMany(() => Floor, floor => floor.building)
  floors: Floor[];

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
