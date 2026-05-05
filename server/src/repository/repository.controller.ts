import { Controller, Get, Param, Query } from '@nestjs/common';
import { RepositoryService } from './repository.service';

@Controller('repositories')
export class RepositoryController {
  constructor(private readonly repositoryService: RepositoryService) {}

  @Get(':owner/:repo')
  async getRepository(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.repositoryService.getRepository(owner, repo);
  }

  @Get(':owner/:repo/stats')
  async getRepositoryStats(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.repositoryService.getRepositoryStats(owner, repo);
  }

  @Get(':owner/:repo/contributors')
  async getContributors(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.repositoryService.getContributors(owner, repo);
  }

  @Get(':owner/:repo/languages')
  async getLanguages(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.repositoryService.getLanguages(owner, repo);
  }

  @Get(':owner/:repo/tags')
  async getTags(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.repositoryService.getTags(owner, repo);
  }

  @Get(':owner/:repo/branches')
  async getBranches(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.repositoryService.getBranches(owner, repo);
  }

  @Get(':owner/:repo/stargazers')
  async getStargazers(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.repositoryService.getStargazers(owner, repo, page, perPage);
  }

  @Get(':owner/:repo/stargazers/history')
  async getStargazersHistory(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.repositoryService.getStargazersHistory(owner, repo);
  }

  @Get(':owner/:repo/forks')
  async getForks(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.repositoryService.getForks(owner, repo, page, perPage);
  }

  @Get(':owner/:repo/watchers')
  async getWatchers(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.repositoryService.getWatchers(owner, repo, page, perPage);
  }

  @Get(':owner/:repo/commits')
  async getCommits(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.repositoryService.getCommits(owner, repo, page, perPage);
  }

  @Get(':owner/:repo/stats/commit-activity')
  async getCommitActivity(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.repositoryService.getCommitActivity(owner, repo);
  }

  @Get(':owner/:repo/stats/code-frequency')
  async getCodeFrequency(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.repositoryService.getCodeFrequency(owner, repo);
  }

  @Get(':owner/:repo/stats/contributors')
  async getContributorStats(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.repositoryService.getContributorStats(owner, repo);
  }

  @Get(':owner/:repo/stats/participation')
  async getParticipation(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.repositoryService.getParticipation(owner, repo);
  }

  @Get(':owner/:repo/stats/punch-card')
  async getPunchCard(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.repositoryService.getPunchCard(owner, repo);
  }
}
