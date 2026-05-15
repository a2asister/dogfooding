import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto, UpdateFileDto } from './dto/files.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  async getFiles(@Request() req: any, @Query('parentId') parentId?: string) {
    const parentIdNum = parentId ? parseInt(parentId, 10) : null;
    return this.filesService.getFiles(req.user.userId, parentIdNum);
  }

  @Get(':id')
  async getFile(@Request() req: any, @Param('id') id: string) {
    return this.filesService.getFileById(req.user.userId, parseInt(id, 10));
  }

  @Post()
  async createFile(@Request() req: any, @Body() createFileDto: CreateFileDto) {
    return this.filesService.createFile(req.user.userId, createFileDto);
  }

  @Put(':id')
  async updateFile(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
  ) {
    return this.filesService.updateFile(req.user.userId, parseInt(id, 10), updateFileDto);
  }

  @Delete(':id')
  async deleteFile(@Request() req: any, @Param('id') id: string) {
    return this.filesService.deleteFile(req.user.userId, parseInt(id, 10));
  }
}