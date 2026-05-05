import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ReleaseService } from './release.service';
import { ReleaseController } from './release.controller';
import { GithubModule } from '../github/github.module';

@Module({
  imports: [HttpModule, GithubModule],
  controllers: [ReleaseController],
  providers: [ReleaseService],
  exports: [ReleaseService],
})
export class ReleaseModule {}
