import { Controller, Get, Param, Query } from '@nestjs/common';
import { ComplianceService } from './compliance.service';

@Controller('repositories/:owner/:repo/compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get()
  async analyzeCompliance(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.complianceService.analyzeCompliance(owner, repo);
  }

  @Get('license')
  async getLicense(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.complianceService.getLicense(owner, repo);
  }

  @Get('readme')
  async getReadme(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.complianceService.getReadme(owner, repo);
  }

  @Get('security-policy')
  async getSecurityPolicy(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.complianceService.getSecurityPolicy(owner, repo);
  }

  @Get('code-of-conduct')
  async getCodeOfConduct(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.complianceService.getCodeOfConduct(owner, repo);
  }

  @Get('contributing-guide')
  async getContributingGuide(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.complianceService.getContributingGuide(owner, repo);
  }

  @Get('community-profile')
  async getCommunityProfile(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.complianceService.getCommunityProfile(owner, repo);
  }

  @Get('dependabot-alerts')
  async getDependabotAlerts(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.complianceService.getDependabotAlerts(owner, repo, page, perPage);
  }

  @Get('code-scanning-alerts')
  async getCodeScanningAlerts(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.complianceService.getCodeScanningAlerts(owner, repo, page, perPage);
  }

  @Get('secret-scanning-alerts')
  async getSecretScanningAlerts(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.complianceService.getSecretScanningAlerts(owner, repo, page, perPage);
  }
}
