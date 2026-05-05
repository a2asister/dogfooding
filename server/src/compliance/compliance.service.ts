import { Injectable } from '@nestjs/common';
import { GithubService } from '../github/github.service';

@Injectable()
export class ComplianceService {
  constructor(private readonly githubService: GithubService) {}

  async getLicense(owner: string, repo: string): Promise<any> {
    try {
      return this.githubService.get(`/repos/${owner}/${repo}/license`);
    } catch (error) {
      return {
        license: null,
        message: 'No license found',
      };
    }
  }

  async getRepositoryContent(owner: string, repo: string, path: string): Promise<any> {
    try {
      return this.githubService.get(`/repos/${owner}/${repo}/contents/${path}`);
    } catch (error) {
      return null;
    }
  }

  async getReadme(owner: string, repo: string): Promise<any> {
    try {
      return this.githubService.get(`/repos/${owner}/${repo}/readme`);
    } catch (error) {
      return null;
    }
  }

  async getSecurityPolicy(owner: string, repo: string): Promise<any> {
    return this.getRepositoryContent(owner, repo, 'SECURITY.md');
  }

  async getCodeOfConduct(owner: string, repo: string): Promise<any> {
    return this.getRepositoryContent(owner, repo, 'CODE_OF_CONDUCT.md');
  }

  async getContributingGuide(owner: string, repo: string): Promise<any> {
    return this.getRepositoryContent(owner, repo, 'CONTRIBUTING.md');
  }

  async getCommunityProfile(owner: string, repo: string): Promise<any> {
    try {
      return this.githubService.get(`/repos/${owner}/${repo}/community/profile`);
    } catch (error) {
      return null;
    }
  }

  async getVulnerabilityAlerts(owner: string, repo: string): Promise<any> {
    try {
      return this.githubService.get(`/repos/${owner}/${repo}/vulnerability-alerts`);
    } catch (error) {
      return { enabled: false };
    }
  }

  async getDependabotAlerts(owner: string, repo: string, page = 1, perPage = 30): Promise<any> {
    try {
      return this.githubService.get(`/repos/${owner}/${repo}/dependabot/alerts`, {
        page,
        per_page: perPage,
      });
    } catch (error) {
      return [];
    }
  }

  async getCodeScanningAlerts(owner: string, repo: string, page = 1, perPage = 30): Promise<any> {
    try {
      return this.githubService.get(`/repos/${owner}/${repo}/code-scanning/alerts`, {
        page,
        per_page: perPage,
      });
    } catch (error) {
      return [];
    }
  }

  async getSecretScanningAlerts(owner: string, repo: string, page = 1, perPage = 30): Promise<any> {
    try {
      return this.githubService.get(`/repos/${owner}/${repo}/secret-scanning/alerts`, {
        page,
        per_page: perPage,
      });
    } catch (error) {
      return [];
    }
  }

  async analyzeCompliance(owner: string, repo: string): Promise<any> {
    const [
      license,
      readme,
      securityPolicy,
      codeOfConduct,
      contributingGuide,
      communityProfile,
      dependabotAlerts,
    ] = await Promise.all([
      this.getLicense(owner, repo),
      this.getReadme(owner, repo),
      this.getSecurityPolicy(owner, repo),
      this.getCodeOfConduct(owner, repo),
      this.getContributingGuide(owner, repo),
      this.getCommunityProfile(owner, repo),
      this.getDependabotAlerts(owner, repo),
    ]);

    const checks = {
      hasLicense: !!license?.license,
      hasReadme: !!readme,
      hasSecurityPolicy: !!securityPolicy,
      hasCodeOfConduct: !!codeOfConduct,
      hasContributingGuide: !!contributingGuide,
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const score = Math.round((passedChecks / totalChecks) * 100);

    const criticalAlerts = dependabotAlerts?.filter(
      (alert: any) => alert.state === 'open' && alert.severity === 'critical',
    ) || [];
    const highAlerts = dependabotAlerts?.filter(
      (alert: any) => alert.state === 'open' && alert.severity === 'high',
    ) || [];
    const mediumAlerts = dependabotAlerts?.filter(
      (alert: any) => alert.state === 'open' && alert.severity === 'medium',
    ) || [];

    return {
      score,
      checks,
      passedChecks,
      totalChecks,
      license: license?.license,
      communityProfile,
      security: {
        dependabotAlerts: {
          total: dependabotAlerts?.length || 0,
          open: {
            critical: criticalAlerts.length,
            high: highAlerts.length,
            medium: mediumAlerts.length,
          },
          recent: dependabotAlerts?.slice(0, 10) || [],
        },
      },
      files: {
        readme: !!readme,
        securityPolicy: !!securityPolicy,
        codeOfConduct: !!codeOfConduct,
        contributingGuide: !!contributingGuide,
      },
      recommendations: this.generateRecommendations(checks, {
        critical: criticalAlerts.length,
        high: highAlerts.length,
        medium: mediumAlerts.length,
      }),
    };
  }

  private generateRecommendations(
    checks: Record<string, boolean>,
    alerts: { critical: number; high: number; medium: number },
  ): string[] {
    const recommendations: string[] = [];

    if (!checks.hasLicense) {
      recommendations.push('添加开源许可证文件（LICENSE）');
    }
    if (!checks.hasReadme) {
      recommendations.push('创建项目 README 文档');
    }
    if (!checks.hasSecurityPolicy) {
      recommendations.push('添加安全策略文件（SECURITY.md）');
    }
    if (!checks.hasCodeOfConduct) {
      recommendations.push('添加行为准则文件（CODE_OF_CONDUCT.md）');
    }
    if (!checks.hasContributingGuide) {
      recommendations.push('添加贡献指南文件（CONTRIBUTING.md）');
    }
    if (alerts.critical > 0) {
      recommendations.push(`立即修复 ${alerts.critical} 个严重级别的安全漏洞`);
    }
    if (alerts.high > 0) {
      recommendations.push(`尽快修复 ${alerts.high} 个高危级别的安全漏洞`);
    }

    return recommendations;
  }
}
