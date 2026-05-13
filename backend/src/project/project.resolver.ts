import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Project } from './project.entity';
import { ProjectService } from './project.service';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Query(() => [Project])
  async projects(): Promise<Project[]> {
    return this.projectService.findAll();
  }

  @Query(() => Project)
  async project(@Args('id', { type: () => ID }) id: string): Promise<Project> {
    return this.projectService.findOne(id);
  }

  @Mutation(() => Project)
  async createProject(@Args('name') name: string): Promise<Project> {
    return this.projectService.create(name);
  }

  @Mutation(() => Project)
  async updateProject(
    @Args('id', { type: () => ID }) id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('backgroundColor', { nullable: true }) backgroundColor?: string,
    @Args('videoWidth', { nullable: true }) videoWidth?: number,
    @Args('videoHeight', { nullable: true }) videoHeight?: number,
  ): Promise<Project> {
    return this.projectService.update(id, { name, backgroundColor, videoWidth, videoHeight });
  }

  @Mutation(() => Boolean)
  async deleteProject(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.projectService.delete(id);
  }
}
