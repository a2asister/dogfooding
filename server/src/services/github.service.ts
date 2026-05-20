import { Octokit } from 'octokit';
import { config } from '../config';
import { executeQuery, runOneQuery, runQuery } from '../db';
import type { Repository, PullRequest, BranchRule } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { auditService } from './audit.service';

export const githubService = {
  getOAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: config.github.clientId,
      redirect_uri: config.github.callbackUrl,
      scope: 'repo,admin:repo_hook,read:org,user',
      state,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  },

  async exchangeCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
        redirect_uri: config.github.callbackUrl,
      }),
    });

    const data = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      error?: string;
    };

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || '',
      expiresIn: data.expires_in || 28800,
    };
  },

  async getUserInfo(accessToken: string): Promise<{
    id: number;
    login: string;
    email: string;
    avatar_url: string;
    name: string;
  }> {
    const octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.rest.users.getAuthenticated();
    return {
      id: data.id,
      login: data.login,
      email: data.email || `${data.login}@users.noreply.github.com`,
      avatar_url: data.avatar_url,
      name: data.name || data.login,
    };
  },

  async getUserRepositories(accessToken: string): Promise<Repository[]> {
    const octokit = new Octokit({ auth: accessToken });
    const repos: Repository[] = [];
    let page = 1;

    while (true) {
      const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        page,
        per_page: 100,
        visibility: 'all',
        affiliation: 'owner,collaborator,organization_member',
      });

      if (data.length === 0) break;

      for (const repo of data) {
        repos.push({
          id: uuidv4(),
          githubId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          owner: repo.owner.login,
          description: repo.description || undefined,
          htmlUrl: repo.html_url,
          defaultBranch: repo.default_branch,
          isPrivate: repo.private,
          language: repo.language || undefined,
          stars: repo.stargazers_count,
          lastSyncedAt: Date.now(),
          createdAt: Date.now(),
        });
      }

      if (data.length < 100) break;
      page++;
    }

    return repos;
  },

  async getOrgRepositories(accessToken: string, org: string): Promise<Repository[]> {
    const octokit = new Octokit({ auth: accessToken });
    const repos: Repository[] = [];
    let page = 1;

    while (true) {
      const { data } = await octokit.rest.repos.listForOrg({
        org,
        page,
        per_page: 100,
      });

      if (data.length === 0) break;

      for (const repo of data) {
        repos.push({
          id: uuidv4(),
          githubId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          owner: repo.owner.login,
          description: repo.description || undefined,
          htmlUrl: repo.html_url,
          defaultBranch: repo.default_branch,
          isPrivate: repo.private,
          language: repo.language || undefined,
          stars: repo.stargazers_count,
          lastSyncedAt: Date.now(),
          createdAt: Date.now(),
        });
      }

      if (data.length < 100) break;
      page++;
    }

    return repos;
  },

  async getUserOrgs(accessToken: string): Promise<{ login: string; avatar_url: string; description: string }[]> {
    const octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.rest.orgs.listForAuthenticatedUser();
    return data.map(org => ({
      login: org.login,
      avatar_url: org.avatar_url,
      description: org.description || '',
    }));
  },

  saveRepository(repo: Repository, userId: string, username: string): Repository {
    const existing = runOneQuery<Repository>('SELECT * FROM repositories WHERE github_id = ?', [repo.githubId]);

    if (existing) {
      executeQuery(
        `UPDATE repositories SET name = ?, full_name = ?, owner = ?, description = ?, html_url = ?,
         default_branch = ?, is_private = ?, language = ?, stars = ?, last_synced_at = ? WHERE github_id = ?`,
        [
          repo.name,
          repo.fullName,
          repo.owner,
          repo.description || null,
          repo.htmlUrl,
          repo.defaultBranch,
          repo.isPrivate ? 1 : 0,
          repo.language || null,
          repo.stars,
          Date.now(),
          repo.githubId,
        ]
      );
      const updated = runOneQuery<Repository>('SELECT * FROM repositories WHERE github_id = ?', [repo.githubId]);
      if (updated) {
        executeQuery('INSERT OR IGNORE INTO user_repositories (user_id, repo_id, permission) VALUES (?, ?, ?)', [
          userId,
          updated.id,
          'admin',
        ]);
        return updated;
      }
      return repo;
    }

    executeQuery(
      `INSERT INTO repositories (id, github_id, name, full_name, owner, description, html_url, default_branch,
       is_private, language, stars, last_synced_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        repo.id,
        repo.githubId,
        repo.name,
        repo.fullName,
        repo.owner,
        repo.description || null,
        repo.htmlUrl,
        repo.defaultBranch,
        repo.isPrivate ? 1 : 0,
        repo.language || null,
        repo.stars,
        Date.now(),
        Date.now(),
      ]
    );

    executeQuery('INSERT INTO user_repositories (user_id, repo_id, permission) VALUES (?, ?, ?)', [
      userId,
      repo.id,
      'admin',
    ]);

    auditService.log(userId, username, 'repository:add', 'github', {
      repoId: repo.id,
      fullName: repo.fullName,
    });

    return repo;
  },

  async syncRepositories(userId: string, accessToken: string, username: string): Promise<Repository[]> {
    const repos = await this.getUserRepositories(accessToken);
    const savedRepos: Repository[] = [];

    for (const repo of repos) {
      savedRepos.push(this.saveRepository(repo, userId, username));
    }

    return savedRepos;
  },

  async createBranchProtection(
    accessToken: string,
    owner: string,
    repo: string,
    branch: string,
    rule: Partial<BranchRule>
  ): Promise<void> {
    const octokit = new Octokit({ auth: accessToken });
    await octokit.rest.repos.updateBranchProtection({
      owner,
      repo,
      branch,
      required_status_checks: rule.requireStatusChecks
        ? {
            strict: true,
            contexts: rule.requireStatusChecks,
          }
        : null,
      required_pull_request_reviews: {
        required_approving_review_count: rule.requiredApprovalCount || 1,
        require_code_owner_reviews: rule.requireCodeOwnerReview || false,
      },
      required_conversation_resolution: rule.requireConversationResolution || false,
      enforce_admins: true,
      allow_force_pushes: false,
      allow_deletions: false,
    });
  },

  async listPullRequests(accessToken: string, owner: string, repo: string): Promise<PullRequest[]> {
    const octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'all',
      per_page: 50,
    });

    return data.map(pr => ({
      id: uuidv4(),
      githubId: pr.id,
      repoId: '',
      number: pr.number,
      title: pr.title,
      body: pr.body || undefined,
      state: pr.state as 'open' | 'closed' | 'merged',
      baseBranch: pr.base.ref,
      headBranch: pr.head.ref,
      author: pr.user?.login || 'unknown',
      authorAvatar: pr.user?.avatar_url,
      approvals: [],
      reviews: [],
      ciStatus: 'pending',
      mergeable: pr.mergeable === true,
      mergeStateStatus: pr.merge_state_status || undefined,
      labels: pr.labels.map(l => l.name),
      mergedAt: pr.merged_at ? new Date(pr.merged_at).getTime() : undefined,
      closedAt: pr.closed_at ? new Date(pr.closed_at).getTime() : undefined,
      createdAt: new Date(pr.created_at).getTime(),
      updatedAt: new Date(pr.updated_at).getTime(),
    }));
  },

  async createWebhook(accessToken: string, owner: string, repo: string, events: string[]): Promise<void> {
    const octokit = new Octokit({ auth: accessToken });
    await octokit.rest.repos.createWebhook({
      owner,
      repo,
      name: 'web',
      events,
      config: {
        url: `${config.github.callbackUrl}/webhook`,
        content_type: 'json',
      },
    });
  },

  listUserRepositories(userId: string): Repository[] {
    return runQuery<Repository>(
      `SELECT r.* FROM repositories r
       INNER JOIN user_repositories ur ON r.id = ur.repo_id
       WHERE ur.user_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );
  },

  getRepositoryById(id: string): Repository | null {
    return runOneQuery<Repository>('SELECT * FROM repositories WHERE id = ?', [id]);
  },

  deleteRepository(id: string, userId: string, username: string): void {
    const repo = this.getRepositoryById(id);
    executeQuery('DELETE FROM repositories WHERE id = ?', [id]);
    if (repo) {
      auditService.log(userId, username, 'repository:delete', 'github', {
        repoId: id,
        fullName: repo.fullName,
      });
    }
  },
};
