import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ResumeService } from './resume.service';
import { Resume, CreateResumeInput, UpdateResumeInput } from './resume.model';

@Resolver(() => Resume)
export class ResumeResolver {
  constructor(private readonly resumeService: ResumeService) {}

  @Query(() => [Resume])
  async resumes(@Args('userId') userId: string) {
    return this.resumeService.findAll(userId);
  }

  @Query(() => Resume, { nullable: true })
  async resume(@Args('id') id: string) {
    return this.resumeService.findOne(id);
  }

  @Mutation(() => Resume)
  async createResume(@Args('input') input: CreateResumeInput) {
    return this.resumeService.create(input);
  }

  @Mutation(() => Resume)
  async updateResume(@Args('id') id: string, @Args('input') input: UpdateResumeInput) {
    return this.resumeService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteResume(@Args('id') id: string) {
    return this.resumeService.delete(id);
  }

  @Mutation(() => String)
  async exportResume(@Args('id') id: string) {
    return this.resumeService.export(id);
  }
}
