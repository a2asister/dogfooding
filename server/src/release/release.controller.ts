import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReleaseService } from './release.service';

@Controller('repositories/:owner/:repo/releases')
export class ReleaseController {
  constructor(private readonly releaseService: ReleaseService) {}

  @Get()
  async getReleases(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.releaseService.getReleases(owner, repo, page, perPage);
  }

  @Get('stats')
  async getReleaseStatistics(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.releaseService.getReleaseStatistics(owner, repo);
  }

  @Get('pipeline')
  async getReleasePipelineStatus(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.releaseService.getReleasePipelineStatus(owner, repo);
  }

  @Get('latest')
  async getLatestRelease(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.releaseService.getLatestRelease(owner, repo);
  }

  @Get('tags/:tag')
  async getReleaseByTag(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('tag') tag: string,
  ) {
    return this.releaseService.getReleaseByTag(owner, repo, tag);
  }

  @Get('tags')
  async getTags(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.releaseService.getTags(owner, repo, page, perPage);
  }

  @Get('milestones')
  async getMilestones(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('state') state?: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.releaseService.getMilestones(owner, repo, state, page, perPage);
  }

  @Get(':releaseId')
  async getRelease(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('releaseId') releaseId: number,
  ) {
    return this.releaseService.getRelease(owner, repo, releaseId);
  }
}
