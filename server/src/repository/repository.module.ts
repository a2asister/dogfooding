import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RepositoryService } from './repository.service';
import { RepositoryController } from './repository.controller';
import { GithubModule } from '../github/github.module';

@Module({
  imports: [HttpModule, GithubModule],
  controllers: [RepositoryController],
  providers: [RepositoryService],
  exports: [RepositoryService],
})
export class RepositoryModule {}
