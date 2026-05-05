import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { GithubModule } from '../github/github.module';

@Module({
  imports: [HttpModule, GithubModule],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
