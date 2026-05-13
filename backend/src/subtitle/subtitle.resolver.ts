import { Resolver, Query, Mutation, Args, ID, Int, Float } from '@nestjs/graphql';
import { Subtitle } from './subtitle.entity';
import { SubtitleService } from './subtitle.service';

@Resolver(() => Subtitle)
export class SubtitleResolver {
  constructor(private readonly subtitleService: SubtitleService) {}

  @Query(() => [Subtitle])
  async subtitles(@Args('projectId', { type: () => ID }) projectId: string): Promise<Subtitle[]> {
    return this.subtitleService.findByProjectId(projectId);
  }

  @Mutation(() => Subtitle)
  async createSubtitle(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('text') text: string,
    @Args('startTime', { type: () => Float }) startTime: number,
    @Args('endTime', { type: () => Float }) endTime: number,
    @Args('color', { nullable: true }) color?: string,
    @Args('fontSize', { type: () => Int, nullable: true }) fontSize?: number,
    @Args('fontFamily', { nullable: true }) fontFamily?: string,
    @Args('animationType', { nullable: true }) animationType?: string,
  ): Promise<Subtitle> {
    return this.subtitleService.create({
      projectId,
      text,
      startTime,
      endTime,
      color,
      fontSize,
      fontFamily,
      animationType,
    });
  }

  @Mutation(() => Subtitle)
  async updateSubtitle(
    @Args('id', { type: () => ID }) id: string,
    @Args('text', { nullable: true }) text?: string,
    @Args('startTime', { type: () => Float, nullable: true }) startTime?: number,
    @Args('endTime', { type: () => Float, nullable: true }) endTime?: number,
    @Args('color', { nullable: true }) color?: string,
    @Args('fontSize', { type: () => Int, nullable: true }) fontSize?: number,
    @Args('fontFamily', { nullable: true }) fontFamily?: string,
    @Args('animationType', { nullable: true }) animationType?: string,
  ): Promise<Subtitle> {
    return this.subtitleService.update(id, {
      text,
      startTime,
      endTime,
      color,
      fontSize,
      fontFamily,
      animationType,
    });
  }

  @Mutation(() => Boolean)
  async deleteSubtitle(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.subtitleService.delete(id);
  }
}
