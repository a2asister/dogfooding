import { v4 as uuidv4 } from 'uuid';
import { executeQuery, runOneQuery, runQuery } from '../db';
import type { PullRequest, BranchRule, PRReview } from '../types';
import { auditService } from './audit.service';
import { BRANCH_NAMING_PATTERNS } from '../config';

export const prService = {
  createBranchRule(
    repoId: string,
    branchPattern: string,
    requiredApprovalCount: number,
    options?: Partial<BranchRule>
  ): BranchRule {
    const now = Date.now();
    const id = uuidv4();

    executeQuery(
      `INSERT INTO branch_rules (id, repo_id, branch_pattern, required_approval_count,
       require_code_owner_review, require_conversation_resolution, require_status_checks, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        repoId,
        branchPattern,
        requiredApprovalCount,
        options?.requireCodeOwnerReview ? 1 : 0,
        options?.requireConversationResolution ? 1 : 0,
        options?.requireStatusChecks ? JSON.stringify(options.requireStatusChecks) : JSON.stringify([]),
        now,
      ]
    );

    return this.getBranchRuleById(id)!;
  },

  getBranchRuleById(id: string): BranchRule | null {
    const rule = runOneQuery<BranchRule>('SELECT * FROM branch_rules WHERE id = ?', [id]);
    if (!rule) return null;
    return {
      ...rule,
      requireStatusChecks: typeof rule.requireStatusChecks === 'string' ? JSON.parse(rule.requireStatusChecks) : rule.requireStatusChecks,
    };
  },

  listBranchRules(repoId: string): BranchRule[] {
    return runQuery<BranchRule>('SELECT * FROM branch_rules WHERE repo_id = ? ORDER BY created_at DESC', [repoId]).map(r => ({
      ...r,
      requireStatusChecks: typeof r.requireStatusChecks === 'string' ? JSON.parse(r.requireStatusChecks) : r.requireStatusChecks,
    }));
  },

  listAllBranchRules(): BranchRule[] {
    return runQuery<BranchRule>('SELECT * FROM branch_rules ORDER BY created_at DESC').map(r => ({
      ...r,
      requireStatusChecks: typeof r.requireStatusChecks === 'string' ? JSON.parse(r.requireStatusChecks) : r.requireStatusChecks,
    }));
  },

  updateBranchRule(id: string, updates: Partial<BranchRule>): BranchRule | null {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.branchPattern) {
      fields.push('branch_pattern = ?');
      values.push(updates.branchPattern);
    }
    if (updates.requiredApprovalCount !== undefined) {
      fields.push('required_approval_count = ?');
      values.push(updates.requiredApprovalCount);
    }
    if (updates.requireCodeOwnerReview !== undefined) {
      fields.push('require_code_owner_review = ?');
      values.push(updates.requireCodeOwnerReview ? 1 : 0);
    }
    if (updates.requireConversationResolution !== undefined) {
      fields.push('require_conversation_resolution = ?');
      values.push(updates.requireConversationResolution ? 1 : 0);
    }
    if (updates.requireStatusChecks) {
      fields.push('require_status_checks = ?');
      values.push(JSON.stringify(updates.requireStatusChecks));
    }

    values.push(id);
    executeQuery(`UPDATE branch_rules SET ${fields.join(', ')} WHERE id = ?`, values);

    return this.getBranchRuleById(id);
  },

  deleteBranchRule(id: string): void {
    executeQuery('DELETE FROM branch_rules WHERE id = ?', [id]);
  },

  validateBranchName(branchName: string): { valid: boolean; pattern?: string; message?: string } {
    for (const [type, pattern] of Object.entries(BRANCH_NAMING_PATTERNS)) {
      if (pattern.test(branchName)) {
        return { valid: true, pattern: type };
      }
    }

    const examples = [
      'feature/user-authentication',
      'bugfix/login-error',
      'hotfix/security-patch',
      'release/v1.2.0',
      'develop',
      'main',
    ];

    return {
      valid: false,
      message: `分支名 "${branchName}" 不符合规范。请使用以下格式之一:\n${examples.join('\n')}`,
    };
  },

  createPullRequest(
    repoId: string,
    githubId: number,
    number: number,
    title: string,
    baseBranch: string,
    headBranch: string,
    author: string,
    options?: Partial<PullRequest>
  ): PullRequest {
    const now = Date.now();
    const id = uuidv4();

    executeQuery(
      `INSERT INTO pull_requests (id, github_id, repo_id, number, title, body, state, base_branch,
       head_branch, author, author_avatar, approvals, reviews, ci_status, mergeable, merge_state_status,
       labels, merged_at, closed_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        githubId,
        repoId,
        number,
        title,
        options?.body || null,
        options?.state || 'open',
        baseBranch,
        headBranch,
        author,
        options?.authorAvatar || null,
        JSON.stringify(options?.approvals || []),
        JSON.stringify(options?.reviews || []),
        options?.ciStatus || 'pending',
        options?.mergeable ? 1 : 0,
        options?.mergeStateStatus || null,
        JSON.stringify(options?.labels || []),
        options?.mergedAt || null,
        options?.closedAt || null,
        now,
        now,
      ]
    );

    return this.getPullRequestById(id)!;
  },

  getPullRequestById(id: string): PullRequest | null {
    const pr = runOneQuery<PullRequest>('SELECT * FROM pull_requests WHERE id = ?', [id]);
    if (!pr) return null;
    return this.deserializePR(pr);
  },

  getPullRequestByNumber(repoId: string, number: number): PullRequest | null {
    const pr = runOneQuery<PullRequest>(
      'SELECT * FROM pull_requests WHERE repo_id = ? AND number = ?',
      [repoId, number]
    );
    if (!pr) return null;
    return this.deserializePR(pr);
  },

  listPullRequests(params: {
    page?: number;
    pageSize?: number;
    repoId?: string;
    state?: string;
    author?: string;
  }): { prs: PullRequest[]; total: number } {
    const { page = 1, pageSize = 20, repoId, state, author } = params;
    const where: string[] = [];
    const sqlParams: unknown[] = [];

    if (repoId) {
      where.push('repo_id = ?');
      sqlParams.push(repoId);
    }
    if (state) {
      where.push('state = ?');
      sqlParams.push(state);
    }
    if (author) {
      where.push('author = ?');
      sqlParams.push(author);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    const prs = runQuery<PullRequest>(
      `SELECT * FROM pull_requests ${whereClause} ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
      [...sqlParams, pageSize, offset]
    ).map(pr => this.deserializePR(pr));

    const countResult = runQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM pull_requests ${whereClause}`,
      sqlParams
    );
    const total = countResult[0]?.count || 0;

    return { prs, total };
  },

  addReview(
    prId: string,
    reviewer: string,
    state: PRReview['state'],
    comment?: string,
    userId?: string,
    username?: string
  ): PullRequest | null {
    const pr = this.getPullRequestById(prId);
    if (!pr) return null;

    const review: PRReview = {
      id: uuidv4(),
      reviewer,
      state,
      comment,
      submittedAt: Date.now(),
    };

    const reviews = [...pr.reviews, review];
    const approvals = reviews.filter(r => r.state === 'approved').map(r => r.reviewer);

    executeQuery(
      'UPDATE pull_requests SET reviews = ?, approvals = ?, updated_at = ? WHERE id = ?',
      [JSON.stringify(reviews), JSON.stringify(approvals), Date.now(), prId]
    );

    if (userId && username) {
      auditService.log(userId, username, 'pr:review', 'pr', {
        prId,
        reviewState: state,
        reviewer,
      });
    }

    return this.getPullRequestById(prId);
  },

  updateCIStatus(prId: string, status: PullRequest['ciStatus']): PullRequest | null {
    executeQuery('UPDATE pull_requests SET ci_status = ?, updated_at = ? WHERE id = ?', [
      status,
      Date.now(),
      prId,
    ]);
    return this.getPullRequestById(prId);
  },

  canMerge(prId: string): { canMerge: boolean; reasons: string[] } {
    const pr = this.getPullRequestById(prId);
    if (!pr) return { canMerge: false, reasons: ['PR不存在'] };

    const reasons: string[] = [];

    if (pr.state !== 'open') {
      reasons.push('PR状态不是开放的');
    }

    if (!pr.mergeable) {
      reasons.push('PR存在合并冲突');
    }

    if (pr.ciStatus === 'failed') {
      reasons.push('CI检查未通过');
    }

    if (pr.ciStatus === 'pending') {
      reasons.push('CI检查正在进行中');
    }

    const rules = this.listBranchRules(pr.repoId);
    const matchingRules = rules.filter(r => {
      const pattern = new RegExp(r.branchPattern.replace('*', '.*'));
      return pattern.test(pr.baseBranch);
    });

    for (const rule of matchingRules) {
      if (pr.approvals.length < rule.requiredApprovalCount) {
        reasons.push(`需要至少 ${rule.requiredApprovalCount} 人审批，当前只有 ${pr.approvals.length} 人`);
      }

      if (rule.requireConversationResolution && pr.mergeStateStatus === 'BLOCKED') {
        reasons.push('存在未解决的对话');
      }
    }

    return {
      canMerge: reasons.length === 0,
      reasons,
    };
  },

  deserializePR(pr: PullRequest): PullRequest {
    return {
      ...pr,
      approvals: typeof pr.approvals === 'string' ? JSON.parse(pr.approvals) : pr.approvals,
      reviews: typeof pr.reviews === 'string' ? JSON.parse(pr.reviews) : pr.reviews,
      labels: typeof pr.labels === 'string' ? JSON.parse(pr.labels) : pr.labels,
    };
  },

  getPRStats(): {
    openPRs: number;
    mergedPRs: number;
    totalPRs: number;
  } {
    const totalPRs = runQuery<{ count: number }>('SELECT COUNT(*) as count FROM pull_requests')[0]?.count || 0;
    const openPRs = runQuery<{ count: number }>(
      "SELECT COUNT(*) as count FROM pull_requests WHERE state = 'open'"
    )[0]?.count || 0;
    const mergedPRs = runQuery<{ count: number }>(
      "SELECT COUNT(*) as count FROM pull_requests WHERE state = 'merged'"
    )[0]?.count || 0;

    return { openPRs, mergedPRs, totalPRs };
  },
};
