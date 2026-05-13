import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { FloorService } from './floor.service';
import { Floor } from '../entities/floor.entity';

@Resolver(() => Floor)
export class FloorResolver {
  constructor(private readonly floorService: FloorService) {}

  @Query(() => [Floor], { name: 'floors' })
  findAll(@Args('buildingId', { type: () => ID, nullable: true }) buildingId?: number) {
    return this.floorService.findAll(buildingId);
  }

  @Query(() => Floor, { name: 'floor', nullable: true })
  findOne(@Args('id', { type: () => ID }) id: number) {
    return this.floorService.findOne(id);
  }

  @Mutation(() => Floor)
  createFloor(
    @Args('buildingId', { type: () => ID }) buildingId: number,
    @Args('floorNumber') floorNumber: number,
  ) {
    return this.floorService.create(buildingId, floorNumber);
  }
}
