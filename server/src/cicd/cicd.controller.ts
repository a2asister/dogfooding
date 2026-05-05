import { Controller, Get, Param, Query } from '@nestjs/common';
import { CICDService } from './cicd.service';

@Controller('repositories/:owner/:repo/actions')
export class CICDController {
  constructor(private readonly cicdService: CICDService) {}

  @Get('workflows')
  async getWorkflows(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.cicdService.getWorkflows(owner, repo, page, perPage);
  }

  @Get('workflows/:workflowId')
  async getWorkflow(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('workflowId') workflowId: string,
  ) {
    return this.cicdService.getWorkflow(owner, repo, workflowId);
  }

  @Get('workflows/:workflowId/runs')
  async getWorkflowRunsByWorkflow(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('workflowId') workflowId: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.cicdService.getWorkflowRuns(owner, repo, workflowId, status, page, perPage);
  }

  @Get('runs')
  async getWorkflowRuns(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.cicdService.getWorkflowRuns(owner, repo, undefined, status, page, perPage);
  }

  @Get('stats')
  async getCICDStatistics(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.cicdService.getCICDStatistics(owner, repo);
  }

  @Get('runs/:runId')
  async getWorkflowRun(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('runId') runId: number,
  ) {
    return this.cicdService.getWorkflowRun(owner, repo, runId);
  }

  @Get('runs/:runId/jobs')
  async getWorkflowRunJobs(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('runId') runId: number,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.cicdService.getWorkflowRunJobs(owner, repo, runId, page, perPage);
  }

  @Get('runs/:runId/logs')
  async getWorkflowRunLogs(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('runId') runId: number,
  ) {
    return this.cicdService.getWorkflowRunLogs(owner, repo, runId);
  }

  @Get('runs/:runId/timing')
  async getWorkflowUsage(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('runId') runId: number,
  ) {
    return this.cicdService.getWorkflowUsage(owner, repo, runId);
  }

  @Get('artifacts')
  async getArtifacts(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.cicdService.getArtifacts(owner, repo, page, perPage);
  }
}
