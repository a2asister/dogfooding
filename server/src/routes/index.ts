import Router from 'koa-router';
import crypto from 'crypto';
import { authService } from '../services/auth.service';
import { githubService } from '../services/github.service';
import { pipelineService } from '../services/pipeline.service';
import { deployService } from '../services/deploy.service';
import { prService } from '../services/pr.service';
import { auditService } from '../services/audit.service';
import { alertService } from '../services/alert.service';
import { authMiddleware, requirePermission, highRiskOperation, requireRole } from '../middleware/auth.middleware';
import type { UserRole } from '../types';

const router = new Router({ prefix: '/api' });

router.get('/health', (ctx) => {
  ctx.body = { status: 'ok', timestamp: Date.now() };
});

router.get('/auth/github/login', (ctx) => {
  const state = crypto.randomBytes(16).toString('hex');
  ctx.session!.oauthState = state;
  ctx.redirect(githubService.getOAuthUrl(state));
});

router.get('/auth/github/callback', async (ctx) => {
  const { code, state } = ctx.query;
  const sessionState = ctx.session!.oauthState;

  if (!code || state !== sessionState) {
    ctx.status = 400;
    ctx.body = { error: '无效的授权请求' };
    return;
  }

  try {
    const { accessToken, refreshToken, expiresIn } = await githubService.exchangeCode(code as string);
    const userInfo = await githubService.getUserInfo(accessToken);

    let user = authService.getUserByGithubId(userInfo.id);
    if (!user) {
      user = await authService.createUser(
        userInfo.login,
        userInfo.email,
        'developer',
        undefined,
        userInfo.id
      );
    }

    authService.updateUserTokens(
      user.id,
      accessToken,
      refreshToken,
      Date.now() + expiresIn * 1000
    );

    const token = authService.generateToken(user);
    ctx.redirect(`http://localhost:42198/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error instanceof Error ? error.message : '授权失败' };
  }
});

router.post('/auth/login', async (ctx) => {
  const { username, password } = ctx.request.body as { username: string; password: string };

  if (username === 'admin' && password === 'admin123') {
    let user = authService.getUserByUsername('admin');
    if (!user) {
      user = await authService.createUser('admin', 'admin@cicd.com', 'admin', password);
    }
    const token = authService.generateToken(user);
    ctx.body = { token, user };
    return;
  }

  ctx.status = 401;
  ctx.body = { error: '用户名或密码错误' };
});

router.get('/auth/me', authMiddleware, (ctx) => {
  const user = authService.getUserById(ctx.state.user.id);
  ctx.body = { user };
});

router.get('/users', authMiddleware, requireRole('admin'), (ctx) => {
  const { page = 1, pageSize = 20, role } = ctx.query;
  const result = authService.listUsers({
    page: Number(page),
    pageSize: Number(pageSize),
    role: role as UserRole,
  });
  ctx.body = result;
});

router.put('/users/:id/role', authMiddleware, requireRole('admin'), (ctx) => {
  const { id } = ctx.params;
  const { role } = ctx.request.body as { role: UserRole };
  const user = authService.updateUserRole(id, role, ctx.state.user.id, ctx.state.user.username);
  ctx.body = { user };
});

router.get('/github/repos', authMiddleware, async (ctx) => {
  const user = authService.getUserById(ctx.state.user.id);
  if (!user?.accessToken) {
    ctx.status = 400;
    ctx.body = { error: '请先授权GitHub账号' };
    return;
  }
  const repos = await githubService.getUserRepositories(user.accessToken);
  ctx.body = { repos };
});

router.get('/github/orgs', authMiddleware, async (ctx) => {
  const user = authService.getUserById(ctx.state.user.id);
  if (!user?.accessToken) {
    ctx.status = 400;
    ctx.body = { error: '请先授权GitHub账号' };
    return;
  }
  const orgs = await githubService.getUserOrgs(user.accessToken);
  ctx.body = { orgs };
});

router.post('/github/repos/sync', authMiddleware, async (ctx) => {
  const user = authService.getUserById(ctx.state.user.id);
  if (!user?.accessToken) {
    ctx.status = 400;
    ctx.body = { error: '请先授权GitHub账号' };
    return;
  }
  const repos = await githubService.syncRepositories(user.id, user.accessToken, user.username);
  ctx.body = { repos, count: repos.length };
});

router.post('/github/repos/:id/import', authMiddleware, async (ctx) => {
  const { repo } = ctx.request.body as { repo: unknown };
  const saved = githubService.saveRepository(repo as never, ctx.state.user.id, ctx.state.user.username);
  ctx.body = { repo: saved };
});

router.get('/repositories', authMiddleware, (ctx) => {
  const repos = githubService.listUserRepositories(ctx.state.user.id);
  ctx.body = { repos };
});

router.get('/repositories/:id', authMiddleware, (ctx) => {
  const repo = githubService.getRepositoryById(ctx.params.id);
  if (!repo) {
    ctx.status = 404;
    ctx.body = { error: '仓库不存在' };
    return;
  }
  ctx.body = { repo };
});

router.delete('/repositories/:id', authMiddleware, highRiskOperation('repository:delete'), (ctx) => {
  githubService.deleteRepository(ctx.params.id, ctx.state.user.id, ctx.state.user.username);
  ctx.body = { success: true };
});

router.get('/repositories/:repoId/branch-rules', authMiddleware, (ctx) => {
  const repoId = ctx.params.repoId;
  if (repoId === 'all') {
    const rules = prService.listAllBranchRules();
    ctx.body = { rules };
  } else {
    const rules = prService.listBranchRules(repoId);
    ctx.body = { rules };
  }
});

router.post('/repositories/:repoId/branch-rules', authMiddleware, highRiskOperation('branch_protection:modify'), (ctx) => {
  const { branchPattern, requiredApprovalCount, requireCodeOwnerReview, requireConversationResolution, requireStatusChecks } = ctx.request.body as {
    branchPattern: string;
    requiredApprovalCount: number;
    requireCodeOwnerReview?: boolean;
    requireConversationResolution?: boolean;
    requireStatusChecks?: string[];
  };
  const rule = prService.createBranchRule(ctx.params.repoId, branchPattern, requiredApprovalCount, {
    requireCodeOwnerReview,
    requireConversationResolution,
    requireStatusChecks,
  });
  ctx.body = { rule };
});

router.put('/branch-rules/:id', authMiddleware, highRiskOperation('branch_protection:modify'), (ctx) => {
  const rule = prService.updateBranchRule(ctx.params.id, ctx.request.body as never);
  ctx.body = { rule };
});

router.delete('/branch-rules/:id', authMiddleware, highRiskOperation('branch_protection:modify'), (ctx) => {
  prService.deleteBranchRule(ctx.params.id);
  ctx.body = { success: true };
});

router.post('/branch/validate', authMiddleware, (ctx) => {
  const { name } = ctx.request.body as { name: string };
  const result = prService.validateBranchName(name);
  ctx.body = result;
});

router.get('/pull-requests', authMiddleware, (ctx) => {
  const { page = 1, pageSize = 20, repoId, state, author } = ctx.query;
  const result = prService.listPullRequests({
    page: Number(page),
    pageSize: Number(pageSize),
    repoId: repoId as string,
    state: state as string,
    author: author as string,
  });
  ctx.body = result;
});

router.get('/pull-requests/:id', authMiddleware, (ctx) => {
  const pr = prService.getPullRequestById(ctx.params.id);
  if (!pr) {
    ctx.status = 404;
    ctx.body = { error: 'PR不存在' };
    return;
  }
  ctx.body = { pr };
});

router.post('/pull-requests/:id/review', authMiddleware, requirePermission('pr', 'review'), (ctx) => {
  const { state, comment } = ctx.request.body as { state: 'approved' | 'changes_requested' | 'commented'; comment?: string };
  const pr = prService.addReview(ctx.params.id, ctx.state.user.username, state, comment, ctx.state.user.id, ctx.state.user.username);
  ctx.body = { pr };
});

router.get('/pull-requests/:id/merge-check', authMiddleware, (ctx) => {
  const result = prService.canMerge(ctx.params.id);
  ctx.body = result;
});

router.get('/pipelines', authMiddleware, (ctx) => {
  const { page = 1, pageSize = 20, repoId } = ctx.query;
  const result = pipelineService.list({
    page: Number(page),
    pageSize: Number(pageSize),
    repoId: repoId as string,
  });
  ctx.body = result;
});

router.post('/pipelines', authMiddleware, requirePermission('pipeline', 'create'), (ctx) => {
  const { repoId, name, triggerType, language, buildScript, environment, testScript, deployScript, branchPattern, variables } = ctx.request.body as {
    repoId: string;
    name: string;
    triggerType: 'push' | 'pull_request' | 'schedule' | 'manual';
    language: string;
    buildScript: string;
    environment: string;
    testScript?: string;
    deployScript?: string;
    branchPattern?: string;
    variables?: Record<string, string>;
  };
  const pipeline = pipelineService.create(
    repoId,
    name,
    triggerType,
    language,
    buildScript,
    environment,
    ctx.state.user.id,
    ctx.state.user.username,
    { testScript, deployScript, branchPattern, variables }
  );
  ctx.body = { pipeline };
});

router.get('/pipelines/:id', authMiddleware, (ctx) => {
  const pipeline = pipelineService.getById(ctx.params.id);
  if (!pipeline) {
    ctx.status = 404;
    ctx.body = { error: '流水线不存在' };
    return;
  }
  ctx.body = { pipeline };
});

router.put('/pipelines/:id', authMiddleware, requirePermission('pipeline', 'update'), (ctx) => {
  const pipeline = pipelineService.update(ctx.params.id, ctx.request.body as never, ctx.state.user.id, ctx.state.user.username);
  ctx.body = { pipeline };
});

router.delete('/pipelines/:id', authMiddleware, requirePermission('pipeline', 'delete'), (ctx) => {
  pipelineService.delete(ctx.params.id, ctx.state.user.id, ctx.state.user.username);
  ctx.body = { success: true };
});

router.post('/pipelines/:id/run', authMiddleware, requirePermission('pipeline', 'run'), async (ctx) => {
  const { repoId, commitSha, commitMessage, branch } = ctx.request.body as {
    repoId: string;
    commitSha: string;
    commitMessage: string;
    branch: string;
  };
  const repo = githubService.getRepositoryById(repoId);
  if (!repo) {
    ctx.status = 404;
    ctx.body = { error: '仓库不存在' };
    return;
  }
  const run = await pipelineService.runPipeline(
    ctx.params.id,
    repo,
    commitSha,
    commitMessage,
    branch,
    ctx.state.user.id,
    ctx.state.user.username
  );
  ctx.body = { run };
});

router.get('/pipeline-runs', authMiddleware, (ctx) => {
  const { page = 1, pageSize = 20, pipelineId, repoId, status } = ctx.query;
  const result = pipelineService.listRuns({
    page: Number(page),
    pageSize: Number(pageSize),
    pipelineId: pipelineId as string,
    repoId: repoId as string,
    status: status as string,
  });
  ctx.body = result;
});

router.get('/pipeline-runs/:id', authMiddleware, (ctx) => {
  const run = pipelineService.getRunById(ctx.params.id);
  if (!run) {
    ctx.status = 404;
    ctx.body = { error: '运行记录不存在' };
    return;
  }
  ctx.body = { run };
});

router.post('/pipeline-runs/:id/cancel', authMiddleware, (ctx) => {
  pipelineService.cancelRun(ctx.params.id, ctx.state.user.id, ctx.state.user.username);
  ctx.body = { success: true };
});

router.get('/environments', authMiddleware, (ctx) => {
  const envs = deployService.listEnvironments();
  ctx.body = { environments: envs };
});

router.post('/environments', authMiddleware, requireRole('admin'), (ctx) => {
  const { name, type, description, deployUrl } = ctx.request.body as {
    name: string;
    type: 'dev' | 'test' | 'staging' | 'production';
    description?: string;
    deployUrl?: string;
  };
  const env = deployService.createEnvironment(name, type, description, deployUrl);
  ctx.body = { environment: env };
});

router.post('/deployments', authMiddleware, requirePermission('deployment', 'deploy'), async (ctx) => {
  const { envId, repoId, version, commitSha } = ctx.request.body as {
    envId: string;
    repoId: string;
    version: string;
    commitSha: string;
  };
  const deployment = await deployService.deploy(envId, repoId, version, commitSha, ctx.state.user.id, ctx.state.user.username);
  ctx.body = { deployment };
});

router.get('/deployments', authMiddleware, (ctx) => {
  const { page = 1, pageSize = 20, envId, repoId, status } = ctx.query;
  const result = deployService.listDeployments({
    page: Number(page),
    pageSize: Number(pageSize),
    envId: envId as string,
    repoId: repoId as string,
    status: status as string,
  });
  ctx.body = result;
});

router.post('/deployments/:id/rollback', authMiddleware, highRiskOperation('rollback:production'), async (ctx) => {
  const deployment = await deployService.rollback(ctx.params.id, ctx.state.user.id, ctx.state.user.username);
  ctx.body = { deployment };
});

router.get('/repositories/:repoId/snapshots', authMiddleware, (ctx) => {
  const snapshots = deployService.listSnapshots(ctx.params.repoId);
  ctx.body = { snapshots };
});

router.post('/repositories/:repoId/snapshots', authMiddleware, (ctx) => {
  const { version, commitSha, commitMessage, branch, description, tags, artifactUrl } = ctx.request.body as {
    version: string;
    commitSha: string;
    commitMessage: string;
    branch: string;
    description?: string;
    tags?: string[];
    artifactUrl?: string;
  };
  const snapshot = deployService.createSnapshot(
    ctx.params.repoId,
    version,
    commitSha,
    commitMessage,
    branch,
    ctx.state.user.username,
    { description, tags, artifactUrl }
  );
  ctx.body = { snapshot };
});

router.get('/audit-logs', authMiddleware, requireRole('admin'), (ctx) => {
  const { page = 1, pageSize = 20, userId, action, module, startTime, endTime } = ctx.query;
  const result = auditService.list({
    page: Number(page),
    pageSize: Number(pageSize),
    userId: userId as string,
    action: action as string,
    module: module as string,
    startTime: startTime ? Number(startTime) : undefined,
    endTime: endTime ? Number(endTime) : undefined,
  });
  ctx.body = result;
});

router.get('/audit-logs/export', authMiddleware, requireRole('admin'), (ctx) => {
  const { userId, action, module, startTime, endTime } = ctx.query;
  const csv = auditService.export({
    userId: userId as string,
    action: action as string,
    module: module as string,
    startTime: startTime ? Number(startTime) : undefined,
    endTime: endTime ? Number(endTime) : undefined,
  });
  ctx.set('Content-Type', 'text/csv; charset=utf-8');
  ctx.set('Content-Disposition', 'attachment; filename="audit-logs.csv"');
  ctx.body = csv;
});

router.get('/alerts', authMiddleware, (ctx) => {
  const { page = 1, pageSize = 20, read, level } = ctx.query;
  const result = alertService.list({
    page: Number(page),
    pageSize: Number(pageSize),
    read: read !== undefined ? read === 'true' : undefined,
    level: level as never,
  });
  ctx.body = result;
});

router.post('/alerts/mark-read', authMiddleware, (ctx) => {
  const { ids } = ctx.request.body as { ids: string[] };
  alertService.markAsRead(ids);
  ctx.body = { success: true };
});

router.post('/alerts/mark-all-read', authMiddleware, (ctx) => {
  alertService.markAllAsRead();
  ctx.body = { success: true };
});

router.delete('/alerts/:id', authMiddleware, (ctx) => {
  alertService.delete(ctx.params.id);
  ctx.body = { success: true };
});

router.get('/dashboard/stats', authMiddleware, (ctx) => {
  const pipelineStats = pipelineService.getDashboardStats();
  const prStats = prService.getPRStats();
  const deployStats = deployService.getDeploymentStats();
  const alertStats = alertService.list({ page: 1, pageSize: 1 });

  ctx.body = {
    pipelines: pipelineStats,
    pullRequests: prStats,
    deployments: deployStats,
    alerts: {
      unreadCount: alertStats.unreadCount,
    },
  };
});

export default router;
