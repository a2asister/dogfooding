import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CodeSnippetService } from './code-snippet.service';
import { CodeSnippet } from './entity/code-snippet.entity';

@Controller('api/code-snippets')
export class CodeSnippetController {
  constructor(private readonly codeSnippetService: CodeSnippetService) {}

  @Get()
  findAll(): Promise<CodeSnippet[]> {
    return this.codeSnippetService.findAll();
  }

  @Get('search')
  search(@Query('q') keyword: string): Promise<CodeSnippet[]> {
    return this.codeSnippetService.search(keyword);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CodeSnippet> {
    return this.codeSnippetService.findOne(+id);
  }

  @Post()
  create(@Body() snippet: Partial<CodeSnippet>): Promise<CodeSnippet> {
    return this.codeSnippetService.create(snippet);
  }
}
