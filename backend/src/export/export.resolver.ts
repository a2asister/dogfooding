import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { ExportService } from './export.service';

@Resolver()
export class ExportResolver {
  constructor(private readonly exportService: ExportService) {}

  @Mutation(() => String)
  async exportVideo(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('format', { nullable: true }) format?: string,
  ): Promise<string> {
    return this.exportService.exportProject(projectId, format);
  }
}
