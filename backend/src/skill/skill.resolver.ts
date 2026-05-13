import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Skill } from './skill.entity';
import { SkillService } from './skill.service';

@Resolver(() => Skill)
export class SkillResolver {
  constructor(private skillService: SkillService) {}

  @Query(() => [Skill])
  async skills(@Args('userId', { type: () => Int }) userId: number): Promise<Skill[]> {
    return this.skillService.findByUserId(userId);
  }

  @Mutation(() => Skill)
  async createSkill(
    @Args('name') name: string,
    @Args('userId', { type: () => Int }) userId: number,
    @Args('description', { nullable: true }) description?: string,
    @Args('proficiency', { type: () => Int, nullable: true }) proficiency?: number,
    @Args('category', { nullable: true }) category?: string,
    @Args('icon', { nullable: true }) icon?: string,
    @Args('primaryColor', { nullable: true }) primaryColor?: string,
    @Args('secondaryColor', { nullable: true }) secondaryColor?: string,
  ): Promise<Skill> {
    return this.skillService.create({
      name,
      userId,
      description,
      proficiency,
      category,
      icon,
      primaryColor,
      secondaryColor,
    });
  }

  @Mutation(() => Skill, { nullable: true })
  async updateSkill(
    @Args('id', { type: () => Int }) id: number,
    @Args('name', { nullable: true }) name?: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('proficiency', { type: () => Int, nullable: true }) proficiency?: number,
    @Args('category', { nullable: true }) category?: string,
    @Args('icon', { nullable: true }) icon?: string,
    @Args('primaryColor', { nullable: true }) primaryColor?: string,
    @Args('secondaryColor', { nullable: true }) secondaryColor?: string,
  ): Promise<Skill | null> {
    return this.skillService.update(id, {
      name,
      description,
      proficiency,
      category,
      icon,
      primaryColor,
      secondaryColor,
    });
  }

  @Mutation(() => Boolean)
  async deleteSkill(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.skillService.delete(id);
  }

  @Mutation(() => [Skill])
  async updateSkillPositions(
    @Args('skills', { type: () => String }) skillsJson: string,
  ): Promise<Skill[]> {
    const skills = JSON.parse(skillsJson);
    return this.skillService.updatePositions(skills);
  }
}