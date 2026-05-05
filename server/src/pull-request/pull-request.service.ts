import { Injectable } from '@nestjs/common';
import { GithubService } from '../github/github.service';

@Injectable()
export class PullRequestService {
  constructor(private readonly githubService: GithubService) {}

  async getPullRequests(
    owner: string,
    repo: string,
    state?: string,
    page = 1,
    perPage = 30,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/pulls`, {
      state,
      page,
      per_page: perPage,
    });
  }

  async getPullRequest(owner: string, repo: string, pullNumber: number): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/pulls/${pullNumber}`);
  }

  async getPullRequestCommits(
    owner: string,
    repo: string,
    pullNumber: number,
    page = 1,
    perPage = 30,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/pulls/${pullNumber}/commits`, {
      page,
      per_page: perPage,
    });
  }

  async getPullRequestFiles(
    owner: string,
    repo: string,
    pullNumber: number,
    page = 1,
    perPage = 30,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/pulls/${pullNumber}/files`, {
      page,
      per_page: perPage,
    });
  }

  async getPullRequestReviews(
    owner: string,
    repo: string,
    pullNumber: number,
    page = 1,
    perPage = 30,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, {
      page,
      per_page: perPage,
    });
  }

  async getPullRequestStatistics(owner: string, repo: string): Promise<any> {
    const [openPRs, closedPRs] = await Promise.all([
      this.getPullRequests(owner, repo, 'open', 1, 1),
      this.getPullRequests(owner, repo, 'closed', 1, 1),
    ]);

    return {
      open: openPRs.length || 0,
      closed: closedPRs.length || 0,
      total: (openPRs.length || 0) + (closedPRs.length || 0),
    };
  }
}
