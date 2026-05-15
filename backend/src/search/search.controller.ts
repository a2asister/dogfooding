import { Controller, Get, Query, UseGuards, Request, Post, HttpCode } from '@nestjs/common';
import { SearchService, SearchCategory } from './search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Request() req: any,
    @Query('q') query: string,
    @Query('category') category?: SearchCategory,
    @Query('limit') limit?: string,
    @Query('exact') exact?: string,
  ) {
    return this.searchService.search(
      req.user.userId,
      query,
      category,
      limit ? parseInt(limit) : 20,
      exact === 'true',
    );
  }

  @Get('recent')
  async getRecentSearches(@Request() req: any) {
    const searches = await this.searchService.getRecentSearches(req.user.userId);
    return { searches };
  }

  @Post('repair')
  @HttpCode(200)
  async repairSearchIndex(@Request() req: any) {
    return this.searchService.repairSearchIndex(req.user.userId);
  }
}
