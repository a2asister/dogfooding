import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BuildingService } from './building.service';
import { Building } from '../entities/building.entity';
import { CreateBuildingInput, UpdateBuildingInput } from '../dto/building.input';

@Resolver(() => Building)
export class BuildingResolver {
  constructor(private readonly buildingService: BuildingService) {}

  @Query(() => [Building], { name: 'buildings' })
  findAll() {
    return this.buildingService.findAll();
  }

  @Query(() => Building, { name: 'building', nullable: true })
  findOne(@Args('id', { type: () => ID }) id: number) {
    return this.buildingService.findOne(id);
  }

  @Mutation(() => Building)
  createBuilding(@Args('input') input: CreateBuildingInput) {
    return this.buildingService.create(input);
  }

  @Mutation(() => Building, { nullable: true })
  updateBuilding(
    @Args('id', { type: () => ID }) id: number,
    @Args('input') input: UpdateBuildingInput,
  ) {
    return this.buildingService.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteBuilding(@Args('id', { type: () => ID }) id: number) {
    return this.buildingService.remove(id);
  }
}
