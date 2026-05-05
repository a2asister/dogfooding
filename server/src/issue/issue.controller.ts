import { Controller, Get, Param, Query } from '@nestjs/common';
import { IssueService } from './issue.service';

@Controller('repositories/:owner/:repo/issues')
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Get()
  async getIssues(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('state') state?: string,
    @Query('labels') labels?: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.issueService.getIssues(owner, repo, state, labels, page, perPage);
  }

  @Get('stats')
  async getIssueStatistics(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.issueService.getIssueStatistics(owner, repo);
  }

  @Get(':issueNumber')
  async getIssue(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('issueNumber') issueNumber: number,
  ) {
    return this.issueService.getIssue(owner, repo, issueNumber);
  }

  @Get(':issueNumber/comments')
  async getIssueComments(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('issueNumber') issueNumber: number,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.issueService.getIssueComments(owner, repo, issueNumber, page, perPage);
  }

  @Get(':issueNumber/events')
  async getIssueEvents(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('issueNumber') issueNumber: number,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.issueService.getIssueEvents(owner, repo, issueNumber, page, perPage);
  }

  @Get('/labels')
  async getLabels(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.issueService.getLabels(owner, repo, page, perPage);
  }

  @Get('/milestones')
  async getMilestones(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('state') state?: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.issueService.getMilestones(owner, repo, state, page, perPage);
  }
}
