import { Controller, Get, Param, Query } from '@nestjs/common';
import { PullRequestService } from './pull-request.service';

@Controller('repositories/:owner/:repo/pulls')
export class PullRequestController {
  constructor(private readonly pullRequestService: PullRequestService) {}

  @Get()
  async getPullRequests(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('state') state?: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.pullRequestService.getPullRequests(owner, repo, state, page, perPage);
  }

  @Get('stats')
  async getPullRequestStatistics(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.pullRequestService.getPullRequestStatistics(owner, repo);
  }

  @Get(':pullNumber')
  async getPullRequest(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('pullNumber') pullNumber: number,
  ) {
    return this.pullRequestService.getPullRequest(owner, repo, pullNumber);
  }

  @Get(':pullNumber/commits')
  async getPullRequestCommits(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('pullNumber') pullNumber: number,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.pullRequestService.getPullRequestCommits(owner, repo, pullNumber, page, perPage);
  }

  @Get(':pullNumber/files')
  async getPullRequestFiles(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('pullNumber') pullNumber: number,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.pullRequestService.getPullRequestFiles(owner, repo, pullNumber, page, perPage);
  }

  @Get(':pullNumber/reviews')
  async getPullRequestReviews(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('pullNumber') pullNumber: number,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.pullRequestService.getPullRequestReviews(owner, repo, pullNumber, page, perPage);
  }
}
