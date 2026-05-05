import request from './index';

export function getContributorStats(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/contributors/stats`);
}

export function getContributorActivitySummary(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/contributors/summary`);
}

export function getTopContributors(owner: string, repo: string, limit = 10) {
  return request.get(`/repositories/${owner}/${repo}/contributors/top`, {
    params: { limit },
  });
}

export function getContributorDetails(owner: string, repo: string, username: string) {
  return request.get(`/repositories/${owner}/${repo}/contributors/${username}`);
}
