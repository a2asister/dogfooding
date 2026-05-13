import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FoodService } from './food.service';
import { Food } from './food.entity';
import { CreateFoodInput } from './dto/create-food.input';

@Resolver(() => Food)
export class FoodResolver {
  constructor(private foodService: FoodService) {}

  @Query(() => [Food])
  async foods(): Promise<Food[]> {
    return this.foodService.findAll();
  }

  @Query(() => Food)
  async food(@Args('id', { type: () => Int }) id: number): Promise<Food> {
    return this.foodService.findOne(id);
  }

  @Query(() => [Food])
  async foodsByCategory(@Args('category') category: string): Promise<Food[]> {
    return this.foodService.findByCategory(category);
  }

  @Query(() => [String])
  async foodCategories(): Promise<string[]> {
    return this.foodService.getCategories();
  }

  @Mutation(() => Food)
  async createFood(@Args('createFoodInput') createFoodInput: CreateFoodInput): Promise<Food> {
    return this.foodService.create(createFoodInput);
  }
}
