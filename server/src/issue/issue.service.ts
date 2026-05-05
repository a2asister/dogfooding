import { Injectable } from '@nestjs/common';
import { GithubService } from '../github/github.service';

@Injectable()
export class IssueService {
  constructor(private readonly githubService: GithubService) {}

  async getIssues(
    owner: string,
    repo: string,
    state?: string,
    labels?: string,
    page = 1,
    perPage = 30,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/issues`, {
      state,
      labels,
      page,
      per_page: perPage,
    });
  }

  async getIssue(owner: string, repo: string, issueNumber: number): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/issues/${issueNumber}`);
  }

  async getIssueComments(
    owner: string,
    repo: string,
    issueNumber: number,
    page = 1,
    perPage = 30,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
      page,
      per_page: perPage,
    });
  }

  async getIssueEvents(
    owner: string,
    repo: string,
    issueNumber: number,
    page = 1,
    perPage = 30,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/issues/${issueNumber}/events`, {
      page,
      per_page: perPage,
    });
  }

  async getLabels(owner: string, repo: string, page = 1, perPage = 30): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/labels`, {
      page,
      per_page: perPage,
    });
  }

  async getMilestones(
    owner: string,
    repo: string,
    state?: string,
    page = 1,
    perPage = 30,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/milestones`, {
      state,
      page,
      per_page: perPage,
    });
  }

  async getIssueStatistics(owner: string, repo: string): Promise<any> {
    const [openIssues, closedIssues] = await Promise.all([
      this.getIssues(owner, repo, 'open', undefined, 1, 1),
      this.getIssues(owner, repo, 'closed', undefined, 1, 1),
    ]);

    return {
      open: openIssues.length || 0,
      closed: closedIssues.length || 0,
      total: (openIssues.length || 0) + (closedIssues.length || 0),
    };
  }
}
