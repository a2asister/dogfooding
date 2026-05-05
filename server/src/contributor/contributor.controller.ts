import { Controller, Get, Param, Query } from '@nestjs/common';
import { ContributorService } from './contributor.service';

@Controller('repositories/:owner/:repo/contributors')
export class ContributorController {
  constructor(private readonly contributorService: ContributorService) {}

  @Get()
  async getContributors(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.contributorService.getContributors(owner, repo, page, perPage);
  }

  @Get('stats')
  async getContributorStats(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.contributorService.getContributorStats(owner, repo);
  }

  @Get('summary')
  async getContributorActivitySummary(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.contributorService.getContributorActivitySummary(owner, repo);
  }

  @Get('top')
  async getTopContributors(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('limit') limit?: number,
  ) {
    return this.contributorService.getTopContributors(owner, repo, limit);
  }

  @Get(':username')
  async getContributorDetails(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('username') username: string,
  ) {
    return this.contributorService.getContributorDetails(owner, repo, username);
  }

  @Get('stats/commit-activity')
  async getCommitActivity(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.contributorService.getCommitActivity(owner, repo);
  }

  @Get('stats/code-frequency')
  async getCodeFrequency(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.contributorService.getCodeFrequency(owner, repo);
  }

  @Get('stats/participation')
  async getParticipation(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.contributorService.getParticipation(owner, repo);
  }

  @Get('stats/punch-card')
  async getPunchCard(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.contributorService.getPunchCard(owner, repo);
  }
}
