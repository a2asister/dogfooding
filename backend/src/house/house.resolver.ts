import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { HouseService } from './house.service';
import { House } from '../entities/house.entity';
import { CreateHouseInput, UpdateHouseInput } from '../dto/house.input';

@Resolver(() => House)
export class HouseResolver {
  constructor(private readonly houseService: HouseService) {}

  @Query(() => [House], { name: 'houses' })
  findAll(@Args('status', { nullable: true }) status?: string) {
    return this.houseService.findAll(status);
  }

  @Query(() => House, { name: 'house', nullable: true })
  findOne(@Args('id', { type: () => ID }) id: number) {
    return this.houseService.findOne(id);
  }

  @Query(() => [House], { name: 'housesByFloor' })
  findByFloor(@Args('floorId', { type: () => ID }) floorId: number) {
    return this.houseService.findByFloor(floorId);
  }

  @Mutation(() => House)
  createHouse(@Args('input') input: CreateHouseInput) {
    return this.houseService.create(input);
  }

  @Mutation(() => House, { nullable: true })
  updateHouse(
    @Args('id', { type: () => ID }) id: number,
    @Args('input') input: UpdateHouseInput,
  ) {
    return this.houseService.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteHouse(@Args('id', { type: () => ID }) id: number) {
    return this.houseService.remove(id);
  }
}
