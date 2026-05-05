import { Injectable } from '@nestjs/common';
import { GithubService } from '../github/github.service';

@Injectable()
export class RepositoryService {
  constructor(private readonly githubService: GithubService) {}

  async getRepository(owner: string, repo: string): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}`);
  }

  async getRepositoryStats(owner: string, repo: string): Promise<any> {
    const [repoData, contributors, languages, tags, branches] = await Promise.all([
      this.getRepository(owner, repo),
      this.getContributors(owner, repo),
      this.getLanguages(owner, repo),
      this.getTags(owner, repo),
      this.getBranches(owner, repo),
    ]);

    return {
      repository: repoData,
      contributors: {
        total: contributors.length,
        list: contributors.slice(0, 10),
      },
      languages,
      tags: {
        total: tags.length,
        latest: tags[0],
      },
      branches: {
        total: branches.length,
        default: branches.find((b: any) => b.name === repoData.default_branch),
        list: branches,
      },
    };
  }

  async getContributors(owner: string, repo: string): Promise<any[]> {
    return this.githubService.get(`/repos/${owner}/${repo}/contributors`);
  }

  async getLanguages(owner: string, repo: string): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/languages`);
  }

  async getTags(owner: string, repo: string): Promise<any[]> {
    return this.githubService.get(`/repos/${owner}/${repo}/tags`);
  }

  async getBranches(owner: string, repo: string): Promise<any[]> {
    return this.githubService.get(`/repos/${owner}/${repo}/branches`);
  }

  async getStargazers(owner: string, repo: string, page = 1, perPage = 30): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/stargazers`, {
      page,
      per_page: perPage,
    });
  }

  async getStargazersHistory(owner: string, repo: string): Promise<any[]> {
    const response = await this.githubService.get(`/repos/${owner}/${repo}/stargazers`, {
      per_page: 100,
    });
    return response;
  }

  async getForks(owner: string, repo: string, page = 1, perPage = 30): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/forks`, {
      page,
      per_page: perPage,
    });
  }

  async getWatchers(owner: string, repo: string, page = 1, perPage = 30): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/subscribers`, {
      page,
      per_page: perPage,
    });
  }

  async getCommits(owner: string, repo: string, page = 1, perPage = 30): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/commits`, {
      page,
      per_page: perPage,
    });
  }

  async getCommitActivity(owner: string, repo: string): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/stats/commit_activity`);
  }

  async getCodeFrequency(owner: string, repo: string): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/stats/code_frequency`);
  }

  async getContributorStats(owner: string, repo: string): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/stats/contributors`);
  }

  async getParticipation(owner: string, repo: string): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/stats/participation`);
  }

  async getPunchCard(owner: string, repo: string): Promise<any> {
    return this.githubService.get(`/repos/${owner}/${repo}/stats/punch_card`);
  }
}
