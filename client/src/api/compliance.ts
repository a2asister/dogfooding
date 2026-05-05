import request from './index';

export function analyzeCompliance(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/compliance`);
}

export function getLicense(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/compliance/license`);
}

export function getReadme(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/compliance/readme`);
}

export function getSecurityPolicy(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/compliance/security-policy`);
}

export function getCodeOfConduct(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/compliance/code-of-conduct`);
}

export function getContributingGuide(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/compliance/contributing-guide`);
}

export function getCommunityProfile(owner: string, repo: string) {
  return request.get(`/repositories/${owner}/${repo}/compliance/community-profile`);
}

export function getDependabotAlerts(
  owner: string,
  repo: string,
  page = 1,
  perPage = 30,
) {
  return request.get(`/repositories/${owner}/${repo}/compliance/dependabot-alerts`, {
    params: { page, perPage },
  });
}

export function getCodeScanningAlerts(
  owner: string,
  repo: string,
  page = 1,
  perPage = 30,
) {
  return request.get(`/repositories/${owner}/${repo}/compliance/code-scanning-alerts`, {
    params: { page, perPage },
  });
}

export function getSecretScanningAlerts(
  owner: string,
  repo: string,
  page = 1,
  perPage = 30,
) {
  return request.get(`/repositories/${owner}/${repo}/compliance/secret-scanning-alerts`, {
    params: { page, perPage },
  });
}
