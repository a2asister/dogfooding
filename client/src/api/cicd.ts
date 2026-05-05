import request from './index';

export function getWorkflows(owner: string, repo: string, page = 1, perPage = 30) {
  return request.get(`/repositories/${owner}/${repo}/actions/workflows`, {
    params: { page, perPage },
  });
}

export function getWorkflow(owner: string, repo: string, workflowId: string | number) {
  return request.get(`/repositories/${owner}/${repo}/actions/workflows/${workflowId}`);
}

export function getWorkflowRuns(
  owner: string,
  repo: string,
  workflowId?: string | number,
  status?: string,
  page = 1,
  perPage = 30,
) {
  if (workflowId) {
    return request.get(`/repositories/${owner}/${repo}/actions/workflows/${workflowId}/runs`, {
      params: { status, page, perPage },
    });
  }
  return request.get(`/repositories/${owner}/${repo}/actions/runs`, {
    params: { status, page, perPage },
  });
}

export function getWorkflowRun(owner: string, repo: string, runId: number) {
  return request.get(`/repositories/${owner}/${repo}/actions/runs/${runId}`);
}

export function getWorkflowRunJobs(
  owner: string,
  repo: string,
  runId: number,
  page = 1,
  perPage = 30,
) {
  return request.get(`/repositories/${owner}/${repo}/actions/runs/${runId}/jobs`, {
    params: { page, perPage },
  });
}

export function getCICDStatistics(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/actions/stats`);
}

export function getArtifacts(owner: string, repo: string, page = 1, perPage = 30) {
  return request.get(`/repositories/${owner}/${repo}/actions/artifacts`, {
    params: { page, perPage },
  });
}
