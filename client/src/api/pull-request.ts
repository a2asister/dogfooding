import request from './index';

export function getPullRequests(
  owner: string,
  repo: string,
  state?: string,
  page = 1,
  perPage = 30,
) {
  return request.get(`/repositories/${owner}/${repo}/pulls`, {
    params: { state, page, perPage },
  });
}

export function getPullRequest(owner: string, repo: string, pullNumber: number) {
  return request.get(`/repositories/${owner}/${repo}/pulls/${pullNumber}`);
}

export function getPullRequestCommits(
  owner: string,
  repo: string,
  pullNumber: number,
  page = 1,
  perPage = 30,
) {
  return request.get(`/repositories/${owner}/${repo}/pulls/${pullNumber}/commits`, {
    params: { page, perPage },
  });
}

export function getPullRequestFiles(
  owner: string,
  repo: string,
  pullNumber: number,
  page = 1,
  perPage = 30,
) {
  return request.get(`/repositories/${owner}/${repo}/pulls/${pullNumber}/files`, {
    params: { page, perPage },
  });
}

export function getPullRequestReviews(
  owner: string,
  repo: string,
  pullNumber: number,
  page = 1,
  perPage = 30,
) {
  return request.get(`/repositories/${owner}/${repo}/pulls/${pullNumber}/reviews`, {
    params: { page, perPage },
  });
}

export function getPullRequestStatistics(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/pulls/stats`);
}
