import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GithubModule } from './github/github.module';
import { RepositoryModule } from './repository/repository.module';
import { IssueModule } from './issue/issue.module';
import { PullRequestModule } from './pull-request/pull-request.module';
import { ContributorModule } from './contributor/contributor.module';
import { CICDModule } from './cicd/cicd.module';
import { ComplianceModule } from './compliance/compliance.module';
import { ReleaseModule } from './release/release.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    GithubModule,
    RepositoryModule,
    IssueModule,
    PullRequestModule,
    ContributorModule,
    CICDModule,
    ComplianceModule,
    ReleaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
