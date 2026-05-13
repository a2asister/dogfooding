import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { TripService } from './trip.service';
import { Trip } from './entities/trip.entity';
import { TripNode } from './entities/trip-node.entity';
import { CreateTripInput } from './dto/create-trip.dto';
import { CreateTripNodeInput } from './dto/create-trip-node.dto';
import { UpdateTripInput } from './dto/update-trip.dto';

@Resolver(() => Trip)
export class TripResolver {
  constructor(private readonly tripService: TripService) {}

  @Mutation(() => Trip)
  createTrip(@Args('createTripInput') createTripInput: CreateTripInput): Promise<Trip> {
    return this.tripService.create(createTripInput);
  }

  @Mutation(() => TripNode)
  createTripNode(@Args('createTripNodeInput') createTripNodeInput: CreateTripNodeInput): Promise<TripNode> {
    return this.tripService.createNode(createTripNodeInput);
  }

  @Query(() => [Trip], { name: 'trips' })
  findAll(@Args('category', { nullable: true }) category?: string, @Args('isArchived', { nullable: true }) isArchived?: boolean): Promise<Trip[]> {
    return this.tripService.findAll(category, isArchived);
  }

  @Query(() => Trip, { name: 'trip' })
  findOne(@Args('id', { type: () => ID }) id: number): Promise<Trip> {
    return this.tripService.findOne(id);
  }

  @Query(() => [String], { name: 'categories' })
  getCategories(): Promise<string[]> {
    return this.tripService.getCategories();
  }

  @Mutation(() => Trip)
  updateTrip(@Args('updateTripInput') updateTripInput: UpdateTripInput): Promise<Trip> {
    return this.tripService.update(updateTripInput.id, updateTripInput);
  }

  @Mutation(() => Boolean)
  removeTrip(@Args('id', { type: () => ID }) id: number): Promise<boolean> {
    return this.tripService.remove(id);
  }

  @Mutation(() => Boolean)
  removeTripNode(@Args('id', { type: () => ID }) id: number): Promise<boolean> {
    return this.tripService.removeNode(id);
  }
}