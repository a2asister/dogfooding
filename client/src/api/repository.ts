import request from './index';

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  description: string;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  topics: string[];
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  archived: boolean;
  disabled: boolean;
}

export interface RepositoryStats {
  repository: Repository;
  contributors: {
    total: number;
    list: any[];
  };
  languages: Record<string, number>;
  tags: {
    total: number;
    latest: any;
  };
  branches: {
    total: number;
    default: any;
    list: any[];
  };
}

export function getRepository(owner: string, repo: string) {
  return request.get<Repository>(`/repositories/${owner}/${repo}`);
}

export function getRepositoryStats(owner: string, repo: string) {
  return request.get<RepositoryStats>(`/repositories/${owner}/${repo}/stats`);
}

export function getContributors(owner: string, repo: string, page = 1, perPage = 30) {
  return request.get(`/repositories/${owner}/${repo}/contributors`, {
    params: { page, perPage },
  });
}

export function getLanguages(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/languages`);
}

export function getTags(owner: string, repo: string, page = 1, perPage = 30) {
  return request.get(`/repositories/${owner}/${repo}/tags`, {
    params: { page, perPage },
  });
}

export function getBranches(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/branches`);
}

export function getStargazers(owner: string, repo: string, page = 1, perPage = 30) {
  return request.get(`/repositories/${owner}/${repo}/stargazers`, {
    params: { page, perPage },
  });
}

export function getForks(owner: string, repo: string, page = 1, perPage = 30) {
  return request.get(`/repositories/${owner}/${repo}/forks`, {
    params: { page, perPage },
  });
}

export function getCommits(owner: string, repo: string, page = 1, perPage = 30) {
  return request.get(`/repositories/${owner}/${repo}/commits`, {
    params: { page, perPage },
  });
}

export function getCommitActivity(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/stats/commit-activity`);
}

export function getCodeFrequency(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/stats/code-frequency`);
}

export function getParticipation(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/stats/participation`);
}

export function getPunchCard(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/stats/punch-card`);
}
