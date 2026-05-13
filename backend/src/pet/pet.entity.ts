import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { PetPhoto } from './pet-photo.entity';
import { GrowthRecord } from './growth-record.entity';

@ObjectType()
@Entity()
export class Pet {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  species: string;

  @Field()
  @Column()
  breed: string;

  @Field()
  @Column()
  birthday: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  gender: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  weight: number;

  @Field(() => [PetPhoto], { nullable: true })
  @OneToMany(() => PetPhoto, (photo) => photo.pet, { cascade: true })
  photos: PetPhoto[];

  @Field(() => [GrowthRecord], { nullable: true })
  @OneToMany(() => GrowthRecord, (record) => record.pet, { cascade: true })
  growthRecords: GrowthRecord[];

  @Field()
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;
}
