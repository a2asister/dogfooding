import { Controller, Get, Post, Body, Param, Delete, Patch, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';

interface GraphQLQuery {
  operation: 'query' | 'mutation';
  action: string;
  variables?: Record<string, any>;
  fields?: string[];
}

@Controller('api/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('graphql')
  @HttpCode(HttpStatus.OK)
  async graphql(@Body() query: GraphQLQuery) {
    const { operation, action, variables = {}, fields } = query;

    if (operation === 'query') {
      switch (action) {
        case 'comments':
          return { data: await this.commentService.findAllGraphQL(fields || []) };
        case 'comment':
          return { data: await this.commentService.findOne(variables.id, fields) };
        default:
          return { error: 'Unknown query action' };
      }
    }

    if (operation === 'mutation') {
      switch (action) {
        case 'createComment':
          return { data: await this.commentService.create(variables as CreateCommentDto) };
        case 'updateComment':
          return { data: await this.commentService.update(variables.id, variables.dto as UpdateCommentDto) };
        case 'deleteComment':
          await this.commentService.remove(variables.id);
          return { data: { success: true } };
        case 'toggleLike':
          return { data: await this.commentService.toggleLike(variables.id) };
        default:
          return { error: 'Unknown mutation action' };
      }
    }

    return { error: 'Invalid operation type' };
  }

  @Get()
  async findAll() {
    return await this.commentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('fields') fields?: string) {
    const fieldList = fields ? fields.split(',') : undefined;
    return await this.commentService.findOne(id, fieldList);
  }

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    return await this.commentService.create(createCommentDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return await this.commentService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.commentService.remove(id);
  }

  @Post(':id/like')
  async toggleLike(@Param('id') id: string) {
    return await this.commentService.toggleLike(id);
  }
}
