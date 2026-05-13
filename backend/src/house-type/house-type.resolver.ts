import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { HouseTypeService } from './house-type.service';
import { HouseType } from '../entities/house-type.entity';
import { CreateHouseTypeInput } from '../dto/house-type.input';

@Resolver(() => HouseType)
export class HouseTypeResolver {
  constructor(private readonly houseTypeService: HouseTypeService) {}

  @Query(() => [HouseType], { name: 'houseTypes' })
  findAll() {
    return this.houseTypeService.findAll();
  }

  @Query(() => HouseType, { name: 'houseType', nullable: true })
  findOne(@Args('id', { type: () => ID }) id: number) {
    return this.houseTypeService.findOne(id);
  }

  @Mutation(() => HouseType)
  createHouseType(@Args('input') input: CreateHouseTypeInput) {
    return this.houseTypeService.create(input);
  }
}
