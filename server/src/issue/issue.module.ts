import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IssueService } from './issue.service';
import { IssueController } from './issue.controller';
import { GithubModule } from '../github/github.module';

@Module({
  imports: [HttpModule, GithubModule],
  controllers: [IssueController],
  providers: [IssueService],
  exports: [IssueService],
})
export class IssueModule {}
