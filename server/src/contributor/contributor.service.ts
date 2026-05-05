import { Injectable } from '@nestjs/common';
import { GithubService } from '../github/github.service';

@Injectable()
export class ContributorService {
  constructor(private readonly githubService: GithubService) {}

  async getContributors(owner: string, repo: string, page = 1, perPage = 30): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/contributors`, {
      page,
      per_page: perPage,
    });
  }

  async getContributorStats(owner: string, repo: string): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/stats/contributors`);
  }

  async getCommitActivity(owner: string, repo: string): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/stats/commit_activity`);
  }

  async getCodeFrequency(owner: string, repo: string): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/stats/code_frequency`);
  }

  async getParticipation(owner: string, repo: string): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/stats/participation`);
  }

  async getPunchCard(owner: string, repo: string): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/stats/punch_card`);
  }

  async getContributorDetails(owner: string, repo: string, username: string): Promise<any> {
    const [user, contributions] = await Promise.all([
      this.githubService.get(`/users/${username}`),
      this.getContributorStats(owner, repo),
    ]);

    const contributorStats = contributions.find(
      (c: any) => c.author.login.toLowerCase() === username.toLowerCase(),
    );

    return {
      user,
      stats: contributorStats,
    };
  }

  async getTopContributors(owner: string, repo: string, limit = 10): Promise<any> {
    const contributors = await this.getContributors(owner, repo, 1, 100);
    return contributors.slice(0, limit);
  }

  async getContributorActivitySummary(owner: string, repo: string): Promise<any> {
    const [contributorStats, commitActivity, participation] = await Promise.all([
      this.getContributorStats(owner, repo),
      this.getCommitActivity(owner, repo),
      this.getParticipation(owner, repo),
    ]).catch(() => [null, null, null]);

    return {
      totalContributors: contributorStats?.length || 0,
      weeklyCommits: commitActivity?.map((week: any) => ({
        week: week.week,
        total: week.total,
        days: week.days,
      })) || [],
      participation: participation || { all: [], owner: [] },
      topContributors: contributorStats
        ?.sort((a: any, b: any) => b.total - a.total)
        .slice(0, 10)
        .map((c: any) => ({
          author: c.author,
          total: c.total,
          weeks: c.weeks?.length || 0,
        })) || [],
    };
  }
}
