import { Resolver, Query, Args } from '@nestjs/graphql';
import { ImageService } from './image.service';
import { Image } from './image.entity';

@Resolver(() => Image)
export class ImageResolver {
  constructor(private readonly imageService: ImageService) {}

  @Query(() => [Image])
  images(): Promise<Image[]> {
    return this.imageService.findAll();
  }

  @Query(() => [Image])
  imagesByCategory(@Args('category') category: string): Promise<Image[]> {
    return this.imageService.findByCategory(category);
  }

  @Query(() => [String])
  async categories(): Promise<string[]> {
    const result = await this.imageService.findAllCategories();
    return result.map((r: any) => r.category);
  }
}
