import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PullRequestService } from './pull-request.service';
import { PullRequestController } from './pull-request.controller';
import { GithubModule } from '../github/github.module';

@Module({
  imports: [HttpModule, GithubModule],
  controllers: [PullRequestController],
  providers: [PullRequestService],
  exports: [PullRequestService],
})
export class PullRequestModule {}
