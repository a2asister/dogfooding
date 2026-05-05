import { Controller, Get, Query } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('user')
  async getAuthenticatedUser() {
    return this.githubService.getAuthenticatedUser();
  }

  @Get('search')
  async searchRepositories(
    @Query('q') query: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.githubService.searchRepositories(query, page, perPage);
  }
}
