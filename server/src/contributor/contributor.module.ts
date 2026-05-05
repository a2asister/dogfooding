import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ContributorService } from './contributor.service';
import { ContributorController } from './contributor.controller';
import { GithubModule } from '../github/github.module';

@Module({
  imports: [HttpModule, GithubModule],
  controllers: [ContributorController],
  providers: [ContributorService],
  exports: [ContributorService],
})
export class ContributorModule {}
