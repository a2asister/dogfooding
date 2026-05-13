import { Resolver, Query, Mutation, Args, Int, Float } from '@nestjs/graphql';
import { CardStyleConfig } from './card-style-config.entity';
import { CardStyleConfigService } from './card-style-config.service';

@Resolver(() => CardStyleConfig)
export class CardStyleConfigResolver {
  constructor(private configService: CardStyleConfigService) {}

  @Query(() => CardStyleConfig, { nullable: true })
  async cardStyleConfig(@Args('userId', { type: () => Int }) userId: number): Promise<CardStyleConfig | null> {
    return this.configService.findByUserId(userId);
  }

  @Mutation(() => CardStyleConfig)
  async saveCardStyleConfig(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('cardWidth', { type: () => Int, nullable: true }) cardWidth?: number,
    @Args('cardHeight', { type: () => Int, nullable: true }) cardHeight?: number,
    @Args('borderRadius', { type: () => Int, nullable: true }) borderRadius?: number,
    @Args('spacing', { type: () => Int, nullable: true }) spacing?: number,
    @Args('scaleOnHover', { type: () => Float, nullable: true }) scaleOnHover?: number,
    @Args('enableShadow', { nullable: true }) enableShadow?: boolean,
    @Args('enableReflection', { nullable: true }) enableReflection?: boolean,
    @Args('animationDuration', { type: () => Int, nullable: true }) animationDuration?: number,
  ): Promise<CardStyleConfig> {
    return this.configService.createOrUpdate(userId, {
      cardWidth,
      cardHeight,
      borderRadius,
      spacing,
      scaleOnHover,
      enableShadow,
      enableReflection,
      animationDuration,
    });
  }
}