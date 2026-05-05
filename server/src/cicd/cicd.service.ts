import { Injectable } from '@nestjs/common';
import { GithubService } from '../github/github.service';

@Injectable()
export class CICDService {
  constructor(private readonly githubService: GithubService) {}

  async getWorkflows(owner: string, repo: string, page = 1, perPage = 30): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/actions/workflows`, {
      page,
      per_page: perPage,
    });
  }

  async getWorkflow(owner: string, repo: string, workflowId: string | number): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/actions/workflows/${workflowId}`);
  }

  async getWorkflowRuns(
    owner: string,
    repo: string,
    workflowId?: string | number,
    status?: string,
    page = 1,
    perPage = 30,
  ): Promise<any> {
    const endpoint = workflowId
      ? `/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs`
      : `/repos/${owner}/${repo}/actions/runs`;
    return this.githubService.get(endpoint, {
      status,
      page,
      per_page: perPage,
    });
  }

  async getWorkflowRun(
    owner: string,
    repo: string,
    runId: number,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/actions/runs/${runId}`);
  }

  async getWorkflowRunJobs(
    owner: string,
    repo: string,
    runId: number,
    page = 1,
    perPage = 30,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/actions/runs/${runId}/jobs`, {
      page,
      per_page: perPage,
    });
  }

  async getWorkflowRunLogs(
    owner: string,
    repo: string,
    runId: number,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/actions/runs/${runId}/logs`);
  }

  async getWorkflowUsage(
    owner: string,
    repo: string,
    runId: number,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/actions/runs/${runId}/timing`);
  }

  async getArtifacts(
    owner: string,
    repo: string,
    page = 1,
    perPage = 30,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/actions/artifacts`, {
      page,
      per_page: perPage,
    });
  }

  async getCICDStatistics(owner: string, repo: string): Promise<any> {
    const [workflows, recentRuns] = await Promise.all([
      this.getWorkflows(owner, repo),
      this.getWorkflowRuns(owner, repo, undefined, undefined, 1, 100),
    ]).catch(() => [null, null]);

    const runs = recentRuns?.workflow_runs || [];
    const statusCounts: Record<string, number> = {};
    const conclusionCounts: Record<string, number> = {};

    runs.forEach((run: any) => {
      statusCounts[run.status] = (statusCounts[run.status] || 0) + 1;
      if (run.conclusion) {
        conclusionCounts[run.conclusion] = (conclusionCounts[run.conclusion] || 0) + 1;
      }
    });

    return {
      totalWorkflows: workflows?.total_count || 0,
      workflows: workflows?.workflows || [],
      totalRuns: runs.length,
      statusDistribution: statusCounts,
      conclusionDistribution: conclusionCounts,
      recentRuns: runs.slice(0, 10),
    };
  }
}
