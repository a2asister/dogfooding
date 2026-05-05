import request from './index';

export function getReleases(owner: string, repo: string, page = 1, perPage = 30) {
  return request.get(`/repositories/${owner}/${repo}/releases`, {
    params: { page, perPage },
  });
}

export function getRelease(owner: string, repo: string, releaseId: number) {
  return request.get(`/repositories/${owner}/${repo}/releases/${releaseId}`);
}

export function getLatestRelease(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/releases/latest`);
}

export function getReleaseByTag(owner: string, repo: string, tag: string) {
  return request.get(`/repositories/${owner}/${repo}/releases/tags/${tag}`);
}

export function getReleaseStatistics(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/releases/stats`);
}

export function getReleasePipelineStatus(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/releases/pipeline`);
}

export function getTags(owner: string, repo: string, page = 1, perPage = 30) {
  return request.get(`/repositories/${owner}/${repo}/releases/tags`, {
    params: { page, perPage },
  });
}

export function getMilestones(
  owner: string,
  repo: string,
  state?: string,
  page = 1,
  perPage = 30,
) {
  return request.get(`/repositories/${owner}/${repo}/releases/milestones`, {
    params: { state, page, perPage },
  });
}
