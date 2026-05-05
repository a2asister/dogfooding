import { Injectable } from '@nestjs/common';
import { GithubService } from '../github/github.service';

@Injectable()
export class ReleaseService {
  constructor(private readonly githubService: GithubService) {}

  async getReleases(
    owner: string,
    repo: string,
    page = 1,
    perPage = 30,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/releases`, {
      page,
      per_page: perPage,
    });
  }

  async getRelease(
    owner: string,
    repo: string,
    releaseId: number,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/releases/${releaseId}`);
  }

  async getLatestRelease(owner: string, repo: string): Promise<any> {
    try {
      return this.githubService.get(`/repos/${owner}/${repo}/releases/latest`);
    } catch (error) {
      return null;
    }
  }

  async getReleaseByTag(
    owner: string,
    repo: string,
    tag: string,
  ): Promise<any> {
    try {
      return this.githubService.get(`/repos/${owner}/${repo}/releases/tags/${tag}`);
    } catch (error) {
      return null;
    }
  }

  async getTags(
    owner: string,
    repo: string,
    page = 1,
    perPage = 30,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/tags`, {
      page,
      per_page: perPage,
    });
  }

  async getMilestones(
    owner: string,
    repo: string,
    state = 'open',
    page = 1,
    perPage = 30,
  ): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/milestones`, {
      state,
      page,
      per_page: perPage,
      sort: 'due_on',
      direction: 'asc',
    });
  }

  async getReleaseStatistics(owner: string, repo: string): Promise<any> {
    const [releases, tags, latestRelease] = await Promise.all([
      this.getReleases(owner, repo, 1, 100),
      this.getTags(owner, repo, 1, 100),
      this.getLatestRelease(owner, repo),
    ]).catch(() => [null, null, null]);

    const releaseList = releases || [];
    const tagList = tags || [];

    const monthlyReleases: Record<string, number> = {};
    releaseList.forEach((release: any) => {
      const date = new Date(release.published_at || release.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyReleases[key] = (monthlyReleases[key] || 0) + 1;
    });

    const prereleases = releaseList.filter((r: any) => r.prerelease).length;
    const drafts = releaseList.filter((r: any) => r.draft).length;

    return {
      totalReleases: releaseList.length,
      totalTags: tagList.length,
      latestRelease,
      prereleases,
      drafts,
      monthlyReleases: Object.entries(monthlyReleases)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count })),
      recentReleases: releaseList.slice(0, 10),
      recentTags: tagList.slice(0, 10),
    };
  }

  async getReleasePipelineStatus(owner: string, repo: string): Promise<any> {
    const [releases, latestRelease, workflowRuns] = await Promise.all([
      this.getReleases(owner, repo, 1, 5),
      this.getLatestRelease(owner, repo),
      this.githubService
        .get(`/repos/${owner}/${repo}/actions/runs`, {
          status: 'completed',
          per_page: 20,
        })
        .catch(() => ({ workflow_runs: [] })),
    ]).catch(() => [null, null, { workflow_runs: [] }]);

    const runs = workflowRuns?.workflow_runs || [];
    const recentRuns = runs.slice(0, 10);

    const successRate =
      runs.length > 0
        ? Math.round((runs.filter((r: any) => r.conclusion === 'success').length / runs.length) * 100)
        : 0;

    return {
      latestRelease,
      recentReleases: releases?.slice(0, 5) || [],
      recentWorkflows: recentRuns,
      successRate,
      pipelineStatus: {
        lastRun: recentRuns[0] || null,
        lastSuccess: recentRuns.find((r: any) => r.conclusion === 'success') || null,
        consecutiveSuccesses: this.countConsecutiveSuccesses(recentRuns),
      },
    };
  }

  private countConsecutiveSuccesses(runs: any[]): number {
    let count = 0;
    for (const run of runs) {
      if (run.conclusion === 'success') {
        count++;
      } else {
        break;
      }
    }
    return count;
  }
}
