import request from './index';

export function getIssues(
  owner: string,
  repo: string,
  state?: string,
  labels?: string,
  page = 1,
  perPage = 30,
) {
  return request.get(`/repositories/${owner}/${repo}/issues`, {
    params: { state, labels, page, perPage },
  });
}

export function getIssue(owner: string, repo: string, issueNumber: number) {
  return request.get(`/repositories/${owner}/${repo}/issues/${issueNumber}`);
}

export function getIssueComments(
  owner: string,
  repo: string,
  issueNumber: number,
  page = 1,
  perPage = 30,
) {
  return request.get(`/repositories/${owner}/${repo}/issues/${issueNumber}/comments`, {
    params: { page, perPage },
  });
}

export function getIssueStatistics(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/issues/stats`);
}

export function getLabels(owner: string, repo: string, page = 1, perPage = 30) {
  return request.get(`/repositories/${owner}/${repo}/issues/labels`, {
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
  return request.get(`/repositories/${owner}/${repo}/issues/milestones`, {
    params: { state, page, perPage },
  });
}
