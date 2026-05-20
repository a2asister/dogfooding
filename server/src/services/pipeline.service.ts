import { v4 as uuidv4 } from 'uuid';
import { executeQuery, runOneQuery, runQuery } from '../db';
import type { Pipeline, PipelineRun, PipelineTrigger, Repository } from '../types';
import { auditService } from './audit.service';
import { alertService } from './alert.service';
import { config } from '../config';
import { EventEmitter } from 'events';

const pipelineEvents = new EventEmitter();
const runningPipelines = new Map<string, NodeJS.Timeout>();

export const pipelineService = {
  create(
    repoId: string,
    name: string,
    triggerType: PipelineTrigger,
    language: string,
    buildScript: string,
    environment: string,
    userId: string,
    username: string,
    options?: Partial<Pipeline>
  ): Pipeline {
    const now = Date.now();
    const id = uuidv4();

    executeQuery(
      `INSERT INTO pipelines (id, repo_id, name, trigger_type, branch_pattern, language, build_script,
       test_script, deploy_script, environment, variables, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        repoId,
        name,
        triggerType,
        options?.branchPattern || null,
        language,
        buildScript,
        options?.testScript || null,
        options?.deployScript || null,
        environment,
        options?.variables ? JSON.stringify(options.variables) : JSON.stringify({}),
        now,
        now,
      ]
    );

    const pipeline = this.getById(id);
    if (pipeline) {
      auditService.log(userId, username, 'pipeline:create', 'pipeline', {
        pipelineId: id,
        name,
        repoId,
        triggerType,
        language,
      });
    }
    return pipeline!;
  },

  getById(id: string): Pipeline | null {
    const pipeline = runOneQuery<Pipeline>('SELECT * FROM pipelines WHERE id = ?', [id]);
    if (!pipeline) return null;
    return {
      ...pipeline,
      variables: typeof pipeline.variables === 'string' ? JSON.parse(pipeline.variables) : pipeline.variables,
    };
  },

  listByRepo(repoId: string): Pipeline[] {
    return runQuery<Pipeline>('SELECT * FROM pipelines WHERE repo_id = ? ORDER BY created_at DESC', [repoId]).map(p => ({
      ...p,
      variables: typeof p.variables === 'string' ? JSON.parse(p.variables) : p.variables,
    }));
  },

  list(params: { page?: number; pageSize?: number; repoId?: string }): {
    pipelines: Pipeline[];
    total: number;
  } {
    const { page = 1, pageSize = 20, repoId } = params;
    const where: string[] = [];
    const sqlParams: unknown[] = [];

    if (repoId) {
      where.push('repo_id = ?');
      sqlParams.push(repoId);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    const pipelines = runQuery<Pipeline>(
      `SELECT * FROM pipelines ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...sqlParams, pageSize, offset]
    ).map(p => ({
      ...p,
      variables: typeof p.variables === 'string' ? JSON.parse(p.variables) : p.variables,
    }));

    const countResult = runQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM pipelines ${whereClause}`,
      sqlParams
    );
    const total = countResult[0]?.count || 0;

    return { pipelines, total };
  },

  update(id: string, updates: Partial<Pipeline>, userId: string, username: string): Pipeline | null {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.triggerType) {
      fields.push('trigger_type = ?');
      values.push(updates.triggerType);
    }
    if (updates.branchPattern !== undefined) {
      fields.push('branch_pattern = ?');
      values.push(updates.branchPattern || null);
    }
    if (updates.language) {
      fields.push('language = ?');
      values.push(updates.language);
    }
    if (updates.buildScript) {
      fields.push('build_script = ?');
      values.push(updates.buildScript);
    }
    if (updates.testScript !== undefined) {
      fields.push('test_script = ?');
      values.push(updates.testScript || null);
    }
    if (updates.deployScript !== undefined) {
      fields.push('deploy_script = ?');
      values.push(updates.deployScript || null);
    }
    if (updates.environment) {
      fields.push('environment = ?');
      values.push(updates.environment);
    }
    if (updates.variables) {
      fields.push('variables = ?');
      values.push(JSON.stringify(updates.variables));
    }

    fields.push('updated_at = ?');
    values.push(Date.now(), id);

    executeQuery(`UPDATE pipelines SET ${fields.join(', ')} WHERE id = ?`, values);

    const updated = this.getById(id);
    if (updated) {
      auditService.log(userId, username, 'pipeline:update', 'pipeline', {
        pipelineId: id,
        updates: Object.keys(updates),
      });
    }
    return updated;
  },

  delete(id: string, userId: string, username: string): void {
    executeQuery('DELETE FROM pipelines WHERE id = ?', [id]);
    executeQuery('DELETE FROM pipeline_runs WHERE pipeline_id = ?', [id]);
    auditService.log(userId, username, 'pipeline:delete', 'pipeline', { pipelineId: id });
  },

  createRun(
    pipelineId: string,
    repoId: string,
    commitSha: string,
    commitMessage: string,
    branch: string,
    triggeredBy: string
  ): PipelineRun {
    const now = Date.now();
    const id = uuidv4();

    executeQuery(
      `INSERT INTO pipeline_runs (id, pipeline_id, repo_id, commit_sha, commit_message, branch,
       status, stage, output, started_at, triggered_by)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', 'queued', ?, ?, ?)`,
      [id, pipelineId, repoId, commitSha, commitMessage, branch, '', now, triggeredBy]
    );

    const run = this.getRunById(id);
    return run!;
  },

  getRunById(id: string): PipelineRun | null {
    return runOneQuery<PipelineRun>('SELECT * FROM pipeline_runs WHERE id = ?', [id]);
  },

  listRuns(params: {
    page?: number;
    pageSize?: number;
    pipelineId?: string;
    repoId?: string;
    status?: string;
  }): { runs: PipelineRun[]; total: number } {
    const { page = 1, pageSize = 20, pipelineId, repoId, status } = params;
    const where: string[] = [];
    const sqlParams: unknown[] = [];

    if (pipelineId) {
      where.push('pipeline_id = ?');
      sqlParams.push(pipelineId);
    }
    if (repoId) {
      where.push('repo_id = ?');
      sqlParams.push(repoId);
    }
    if (status) {
      where.push('status = ?');
      sqlParams.push(status);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    const runs = runQuery<PipelineRun>(
      `SELECT * FROM pipeline_runs ${whereClause} ORDER BY started_at DESC LIMIT ? OFFSET ?`,
      [...sqlParams, pageSize, offset]
    );

    const countResult = runQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM pipeline_runs ${whereClause}`,
      sqlParams
    );
    const total = countResult[0]?.count || 0;

    return { runs, total };
  },

  async runPipeline(
    pipelineId: string,
    repo: Repository,
    commitSha: string,
    commitMessage: string,
    branch: string,
    triggeredBy: string,
    username: string
  ): Promise<PipelineRun> {
    const pipeline = this.getById(pipelineId);
    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    const run = this.createRun(pipelineId, repo.id, commitSha, commitMessage, branch, username);

    this.executePipeline(run, pipeline);

    auditService.log(triggeredBy, username, 'pipeline:run', 'pipeline', {
      pipelineId,
      runId: run.id,
      repoId: repo.id,
      branch,
    });

    return run;
  },

  async executePipeline(run: PipelineRun, pipeline: Pipeline): Promise<void> {
    this.updateRunStatus(run.id, 'running', 'checkout', '开始拉取代码...\n');

    const timeout = setTimeout(() => {
      if (runningPipelines.has(run.id)) {
        this.updateRunStatus(run.id, 'failed', 'timeout', '\n流水线执行超时');
        runningPipelines.delete(run.id);
        alertService.create(
          'pipeline_failed',
          'error',
          `流水线执行超时`,
          `流水线 ${pipeline.name} 执行超过超时时间`,
          'pipeline',
          run.id
        );
      }
    }, config.pipeline.defaultTimeout);

    runningPipelines.set(run.id, timeout);

    try {
      this.appendOutput(run.id, `代码拉取完成: ${run.commitSha.substring(0, 8)}\n`);

      this.updateRunStatus(run.id, 'running', 'build', '\n开始构建...\n');
      await this.simulateStep(pipeline.buildScript, run.id);

      if (pipeline.testScript) {
        this.updateRunStatus(run.id, 'running', 'test', '\n开始测试...\n');
        await this.simulateStep(pipeline.testScript, run.id);
      }

      if (pipeline.deployScript) {
        this.updateRunStatus(run.id, 'running', 'deploy', '\n开始部署...\n');
        await this.simulateStep(pipeline.deployScript, run.id);
      }

      this.updateRunStatus(run.id, 'success', 'complete', '\n✅ 流水线执行完成');
      pipelineEvents.emit('pipeline:complete', { run, pipeline });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.updateRunStatus(run.id, 'failed', 'error', `\n❌ 流水线执行失败: ${errorMsg}`);
      alertService.create(
        'pipeline_failed',
        'error',
        `流水线执行失败`,
        `流水线 ${pipeline.name} 执行失败: ${errorMsg}`,
        'pipeline',
        run.id
      );
    } finally {
      clearTimeout(timeout);
      runningPipelines.delete(run.id);
    }
  },

  async simulateStep(script: string, runId: string): Promise<void> {
    const lines = script.split('\n').filter(l => l.trim());
    for (let i = 0; i < lines.length; i++) {
      this.appendOutput(runId, `$ ${lines[i]}\n`);
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
      this.appendOutput(runId, `  执行中... ${Math.floor(((i + 1) / lines.length) * 100)}%\n`);
    }
    this.appendOutput(runId, '  ✓ 步骤完成\n');
  },

  updateRunStatus(id: string, status: PipelineRun['status'], stage: string, output: string): void {
    const run = this.getRunById(id);
    if (!run) return;

    const finishedAt = ['success', 'failed', 'cancelled'].includes(status) ? Date.now() : null;
    const duration = finishedAt ? finishedAt - run.startedAt : undefined;

    executeQuery(
      `UPDATE pipeline_runs SET status = ?, stage = ?, output = CONCAT(COALESCE(output, ''), ?),
       finished_at = ?, duration = ? WHERE id = ?`,
      [status, stage, output, finishedAt, duration || null, id]
    );

    pipelineEvents.emit('run:update', { id, status, stage });
  },

  appendOutput(id: string, output: string): void {
    executeQuery(
      `UPDATE pipeline_runs SET output = CONCAT(COALESCE(output, ''), ?) WHERE id = ?`,
      [output, id]
    );
    pipelineEvents.emit('run:output', { id, output });
  },

  cancelRun(id: string, userId: string, username: string): void {
    const timeout = runningPipelines.get(id);
    if (timeout) {
      clearTimeout(timeout);
      runningPipelines.delete(id);
    }
    this.updateRunStatus(id, 'cancelled', 'cancelled', '\n流水线已被取消');
    auditService.log(userId, username, 'pipeline:cancel', 'pipeline', { runId: id });
  },

  getDashboardStats(): {
    totalPipelines: number;
    runningCount: number;
    successRate: number;
    todayRuns: number;
  } {
    const totalPipelines = runQuery<{ count: number }>('SELECT COUNT(*) as count FROM pipelines')[0]?.count || 0;
    const runningCount = runQuery<{ count: number }>(
      "SELECT COUNT(*) as count FROM pipeline_runs WHERE status = 'running'"
    )[0]?.count || 0;

    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const runs = runQuery<PipelineRun>(
      'SELECT status FROM pipeline_runs WHERE started_at > ?',
      [twentyFourHoursAgo]
    );

    const successCount = runs.filter(r => r.status === 'success').length;
    const successRate = runs.length > 0 ? Math.round((successCount / runs.length) * 100) : 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRuns = runQuery<{ count: number }>(
      'SELECT COUNT(*) as count FROM pipeline_runs WHERE started_at > ?',
      [todayStart.getTime()]
    )[0]?.count || 0;

    return {
      totalPipelines,
      runningCount,
      successRate,
      todayRuns,
    };
  },

  on(event: string, handler: (...args: unknown[]) => void): void {
    pipelineEvents.on(event, handler);
  },
};
