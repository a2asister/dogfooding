export interface User {
  id: string;
  username: string;
  email: string;
  githubId?: number;
  avatarUrl?: string;
  role: UserRole;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: number;
  createdAt: number;
  updatedAt: number;
}

export type UserRole = 'admin' | 'developer' | 'tester' | 'viewer';

export interface Repository {
  id: string;
  githubId: number;
  name: string;
  fullName: string;
  owner: string;
  description?: string;
  htmlUrl: string;
  defaultBranch: string;
  isPrivate: boolean;
  language?: string;
  stars: number;
  lastSyncedAt: number;
  createdAt: number;
}

export interface BranchRule {
  id: string;
  repoId: string;
  branchPattern: string;
  requiredApprovalCount: number;
  requireCodeOwnerReview: boolean;
  requireConversationResolution: boolean;
  requireStatusChecks: string[];
  createdAt: number;
}

export interface PullRequest {
  id: string;
  githubId: number;
  repoId: string;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed' | 'merged';
  baseBranch: string;
  headBranch: string;
  author: string;
  authorAvatar?: string;
  approvals: string[];
  reviews: PRReview[];
  ciStatus: 'pending' | 'success' | 'failed' | 'skipped';
  mergeable: boolean;
  mergeStateStatus?: string;
  labels: string[];
  mergedAt?: number;
  closedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface PRReview {
  id: string;
  reviewer: string;
  state: 'approved' | 'changes_requested' | 'commented';
  comment?: string;
  submittedAt: number;
}

export interface Pipeline {
  id: string;
  repoId: string;
  name: string;
  triggerType: PipelineTrigger;
  branchPattern?: string;
  language: string;
  buildScript: string;
  testScript?: string;
  deployScript?: string;
  environment: string;
  variables: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

export type PipelineTrigger = 'push' | 'pull_request' | 'schedule' | 'manual';

export interface PipelineRun {
  id: string;
  pipelineId: string;
  repoId: string;
  commitSha: string;
  commitMessage: string;
  branch: string;
  status: PipelineRunStatus;
  stage: string;
  output: string;
  startedAt: number;
  finishedAt?: number;
  duration?: number;
  triggeredBy: string;
}

export type PipelineRunStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

export interface Environment {
  id: string;
  name: string;
  type: 'dev' | 'test' | 'staging' | 'production';
  description?: string;
  deployUrl?: string;
  lastDeployedAt?: number;
  lastDeployedBy?: string;
  currentVersion?: string;
  createdAt: number;
}

export interface Deployment {
  id: string;
  envId: string;
  repoId: string;
  version: string;
  commitSha: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'rolled_back';
  output: string;
  deployedBy: string;
  startedAt: number;
  finishedAt?: number;
  rollbackTo?: string;
}

export interface VersionSnapshot {
  id: string;
  repoId: string;
  version: string;
  commitSha: string;
  commitMessage: string;
  branch: string;
  tags: string[];
  description?: string;
  artifactUrl?: string;
  createdBy: string;
  createdAt: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  module: string;
  targetId?: string;
  details: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  level: AlertLevel;
  title: string;
  message: string;
  relatedId?: string;
  module: string;
  read: boolean;
  createdAt: number;
}

export type AlertType = 'pipeline_failed' | 'auth_expired' | 'deployment_failed' | 'security' | 'system';
export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';

export interface RolePermission {
  role: UserRole;
  modules: string[];
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: string[];
}
