import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CICDService } from './cicd.service';
import { CICDController } from './cicd.controller';
import { GithubModule } from '../github/github.module';

@Module({
  imports: [HttpModule, GithubModule],
  controllers: [CICDController],
  providers: [CICDService],
  exports: [CICDService],
})
export class CICDModule {}
