import { v4 as uuidv4 } from 'uuid';
import { executeQuery, runOneQuery, runQuery } from '../db';
import type { Environment, Deployment, VersionSnapshot } from '../types';
import { auditService } from './audit.service';
import { alertService } from './alert.service';

export const deployService = {
  createEnvironment(
    name: string,
    type: Environment['type'],
    description?: string,
    deployUrl?: string
  ): Environment {
    const now = Date.now();
    const id = uuidv4();

    executeQuery(
      `INSERT INTO environments (id, name, type, description, deploy_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, type, description || null, deployUrl || null, now]
    );

    return this.getEnvironmentById(id)!;
  },

  getEnvironmentById(id: string): Environment | null {
    return runOneQuery<Environment>('SELECT * FROM environments WHERE id = ?', [id]);
  },

  getEnvironmentByType(type: Environment['type']): Environment | null {
    return runOneQuery<Environment>('SELECT * FROM environments WHERE type = ? LIMIT 1', [type]);
  },

  listEnvironments(): Environment[] {
    return runQuery<Environment>('SELECT * FROM environments ORDER BY created_at ASC');
  },

  updateEnvironment(
    id: string,
    updates: Partial<Omit<Environment, 'id' | 'createdAt'>>
  ): Environment | null {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.type) {
      fields.push('type = ?');
      values.push(updates.type);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description || null);
    }
    if (updates.deployUrl !== undefined) {
      fields.push('deploy_url = ?');
      values.push(updates.deployUrl || null);
    }

    values.push(id);
    executeQuery(`UPDATE environments SET ${fields.join(', ')} WHERE id = ?`, values);

    return this.getEnvironmentById(id);
  },

  deleteEnvironment(id: string): void {
    executeQuery('DELETE FROM environments WHERE id = ?', [id]);
    executeQuery('DELETE FROM deployments WHERE env_id = ?', [id]);
  },

  async deploy(
    envId: string,
    repoId: string,
    version: string,
    commitSha: string,
    userId: string,
    username: string
  ): Promise<Deployment> {
    const env = this.getEnvironmentById(envId);
    if (!env) {
      throw new Error('Environment not found');
    }

    const now = Date.now();
    const id = uuidv4();

    executeQuery(
      `INSERT INTO deployments (id, env_id, repo_id, version, commit_sha, status, output,
       deployed_by, started_at)
       VALUES (?, ?, ?, ?, ?, 'running', ?, ?, ?)`,
      [id, envId, repoId, version, commitSha, `开始部署 ${version} 到 ${env.name}...\n`, username, now]
    );

    auditService.log(userId, username, 'deployment:create', 'deploy', {
      deploymentId: id,
      envId,
      version,
      envType: env.type,
    });

    setTimeout(() => {
      const success = Math.random() > 0.1;
      const finishedAt = Date.now();

      if (success) {
        executeQuery(
          `UPDATE deployments SET status = 'success', output = CONCAT(output, ?), finished_at = ? WHERE id = ?`,
          ['\n✅ 部署完成', finishedAt, id]
        );
        executeQuery(
          `UPDATE environments SET current_version = ?, last_deployed_at = ?, last_deployed_by = ? WHERE id = ?`,
          [version, finishedAt, username, envId]
        );
        auditService.log(userId, username, 'deployment:success', 'deploy', {
          deploymentId: id,
          version,
          envName: env.name,
        });
      } else {
        executeQuery(
          `UPDATE deployments SET status = 'failed', output = CONCAT(output, ?), finished_at = ? WHERE id = ?`,
          ['\n❌ 部署失败: 连接超时', finishedAt, id]
        );
        alertService.create(
          'deployment_failed',
          'error',
          `部署失败`,
          `${version} 部署到 ${env.name} 失败`,
          'deploy',
          id
        );
        auditService.log(userId, username, 'deployment:failed', 'deploy', {
          deploymentId: id,
          version,
          envName: env.name,
        });
      }
    }, 3000);

    return this.getDeploymentById(id)!;
  },

  getDeploymentById(id: string): Deployment | null {
    return runOneQuery<Deployment>('SELECT * FROM deployments WHERE id = ?', [id]);
  },

  listDeployments(params: {
    page?: number;
    pageSize?: number;
    envId?: string;
    repoId?: string;
    status?: string;
  }): { deployments: Deployment[]; total: number } {
    const { page = 1, pageSize = 20, envId, repoId, status } = params;
    const where: string[] = [];
    const sqlParams: unknown[] = [];

    if (envId) {
      where.push('env_id = ?');
      sqlParams.push(envId);
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

    const deployments = runQuery<Deployment>(
      `SELECT * FROM deployments ${whereClause} ORDER BY started_at DESC LIMIT ? OFFSET ?`,
      [...sqlParams, pageSize, offset]
    );

    const countResult = runQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM deployments ${whereClause}`,
      sqlParams
    );
    const total = countResult[0]?.count || 0;

    return { deployments, total };
  },

  async rollback(
    deploymentId: string,
    userId: string,
    username: string
  ): Promise<Deployment> {
    const deployment = this.getDeploymentById(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const env = this.getEnvironmentById(deployment.envId);
    if (!env) {
      throw new Error('Environment not found');
    }

    const previousDeployments = runQuery<Deployment>(
      `SELECT * FROM deployments WHERE env_id = ? AND status = 'success' AND id != ? ORDER BY started_at DESC LIMIT 1`,
      [deployment.envId, deploymentId]
    );

    if (previousDeployments.length === 0) {
      throw new Error('No previous successful deployment found');
    }

    const previous = previousDeployments[0]!;

    const now = Date.now();
    const id = uuidv4();

    executeQuery(
      `INSERT INTO deployments (id, env_id, repo_id, version, commit_sha, status, output,
       deployed_by, started_at, rollback_to)
       VALUES (?, ?, ?, ?, ?, 'running', ?, ?, ?, ?)`,
      [
        id,
        deployment.envId,
        deployment.repoId,
        previous.version,
        previous.commitSha,
        `回滚到 ${previous.version}...\n`,
        username,
        now,
        deploymentId,
      ]
    );

    auditService.log(userId, username, 'deployment:rollback', 'deploy', {
      rollbackId: id,
      fromVersion: deployment.version,
      toVersion: previous.version,
      envName: env.name,
    });

    setTimeout(() => {
      const finishedAt = Date.now();
      executeQuery(
        `UPDATE deployments SET status = 'rolled_back', output = CONCAT(output, ?), finished_at = ? WHERE id = ?`,
        [`\n✅ 回滚完成: ${previous.version}`, finishedAt, id]
      );
      executeQuery(
        `UPDATE environments SET current_version = ?, last_deployed_at = ?, last_deployed_by = ? WHERE id = ?`,
        [previous.version, finishedAt, username, deployment.envId]
      );
    }, 2500);

    return this.getDeploymentById(id)!;
  },

  createSnapshot(
    repoId: string,
    version: string,
    commitSha: string,
    commitMessage: string,
    branch: string,
    createdBy: string,
    options?: Partial<VersionSnapshot>
  ): VersionSnapshot {
    const now = Date.now();
    const id = uuidv4();

    executeQuery(
      `INSERT INTO version_snapshots (id, repo_id, version, commit_sha, commit_message,
       branch, tags, description, artifact_url, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        repoId,
        version,
        commitSha,
        commitMessage,
        branch,
        options?.tags ? JSON.stringify(options.tags) : JSON.stringify([]),
        options?.description || null,
        options?.artifactUrl || null,
        createdBy,
        now,
      ]
    );

    return this.getSnapshotById(id)!;
  },

  getSnapshotById(id: string): VersionSnapshot | null {
    const snapshot = runOneQuery<VersionSnapshot>('SELECT * FROM version_snapshots WHERE id = ?', [id]);
    if (!snapshot) return null;
    return {
      ...snapshot,
      tags: typeof snapshot.tags === 'string' ? JSON.parse(snapshot.tags) : snapshot.tags,
    };
  },

  listSnapshots(repoId: string): VersionSnapshot[] {
    return runQuery<VersionSnapshot>(
      'SELECT * FROM version_snapshots WHERE repo_id = ? ORDER BY created_at DESC',
      [repoId]
    ).map(s => ({
      ...s,
      tags: typeof s.tags === 'string' ? JSON.parse(s.tags) : s.tags,
    }));
  },

  initializeDefaultEnvironments(): void {
    const existing = this.listEnvironments();
    if (existing.length > 0) return;

    this.createEnvironment('开发环境', 'dev', '用于开发人员日常联调测试', 'http://dev.example.com');
    this.createEnvironment('测试环境', 'test', '用于QA功能测试和回归测试', 'http://test.example.com');
    this.createEnvironment('预发环境', 'staging', '生产环境镜像，用于发布前验证', 'http://staging.example.com');
    this.createEnvironment('生产环境', 'production', '正式对外提供服务', 'http://example.com');
  },

  getDeploymentStats(): {
    totalDeployments: number;
    successRate: number;
    activeEnvironments: number;
  } {
    const totalDeployments = runQuery<{ count: number }>('SELECT COUNT(*) as count FROM deployments')[0]?.count || 0;
    const activeEnvironments = runQuery<{ count: number }>('SELECT COUNT(*) as count FROM environments')[0]?.count || 0;

    const allDeployments = runQuery<Deployment>('SELECT status FROM deployments');
    const successCount = allDeployments.filter(d => d.status === 'success').length;
    const successRate = allDeployments.length > 0 ? Math.round((successCount / allDeployments.length) * 100) : 0;

    return { totalDeployments, successRate, activeEnvironments };
  },
};
