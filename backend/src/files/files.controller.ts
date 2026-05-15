import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto, UpdateFileDto, MoveFileDto, CopyFileDto, BatchOperationDto, SortField, SortOrder, FilePathDto, RestoreFileDto } from './dto/files.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  async getFiles(
    @Request() req: any,
    @Query('parentId') parentId?: string,
    @Query('sortField') sortField?: SortField,
    @Query('sortOrder') sortOrder?: SortOrder,
  ) {
    const parentIdNum = parentId ? parseInt(parentId, 10) : null;
    return this.filesService.getFiles(req.user.userId, parentIdNum, sortField, sortOrder);
  }

  @Get('trash')
  async getTrash(@Request() req: any) {
    return this.filesService.getTrash(req.user.userId);
  }

  @Delete('trash/empty')
  async emptyTrash(@Request() req: any) {
    return this.filesService.emptyTrash(req.user.userId);
  }

  @Get('path')
  async getFileByPath(@Request() req: any, @Query() filePathDto: FilePathDto) {
    return this.filesService.getFileByPath(req.user.userId, filePathDto.path);
  }

  @Get(':id/path')
  async getFilePath(@Request() req: any, @Param('id') id: string) {
    return this.filesService.getFilePath(req.user.userId, parseInt(id, 10));
  }

  @Get(':id')
  async getFile(@Request() req: any, @Param('id') id: string) {
    return this.filesService.getFileById(req.user.userId, parseInt(id, 10));
  }

  @Post()
  async createFile(@Request() req: any, @Body() createFileDto: CreateFileDto) {
    return this.filesService.createFile(req.user.userId, createFileDto);
  }

  @Post('batch')
  async batchOperation(@Request() req: any, @Body() batchDto: BatchOperationDto) {
    return this.filesService.batchOperation(req.user.userId, batchDto);
  }

  @Post('sort')
  async sortFiles(
    @Request() req: any,
    @Body() sortDto: { field: SortField; order: SortOrder },
    @Query('parentId') parentId?: string,
  ) {
    const parentIdNum = parentId ? parseInt(parentId, 10) : null;
    return this.filesService.sortFiles(req.user.userId, parentIdNum, sortDto.field, sortDto.order);
  }

  @Put(':id')
  async updateFile(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
  ) {
    return this.filesService.updateFile(req.user.userId, parseInt(id, 10), updateFileDto);
  }

  @Put(':id/move')
  async moveFile(
    @Request() req: any,
    @Param('id') id: string,
    @Body() moveFileDto: MoveFileDto,
  ) {
    return this.filesService.moveFile(req.user.userId, parseInt(id, 10), moveFileDto);
  }

  @Put(':id/copy')
  async copyFile(
    @Request() req: any,
    @Param('id') id: string,
    @Body() copyFileDto: CopyFileDto,
  ) {
    return this.filesService.copyFile(req.user.userId, parseInt(id, 10), copyFileDto);
  }

  @Put(':id/trash')
  async moveToTrash(@Request() req: any, @Param('id') id: string) {
    return this.filesService.moveToTrash(req.user.userId, parseInt(id, 10));
  }

  @Put(':id/restore')
  async restoreFromTrash(
    @Request() req: any,
    @Param('id') id: string,
    @Body() restoreDto: RestoreFileDto,
  ) {
    return this.filesService.restoreFromTrash(req.user.userId, parseInt(id, 10), restoreDto.targetParentId);
  }

  @Delete(':id')
  async permanentlyDelete(@Request() req: any, @Param('id') id: string) {
    return this.filesService.permanentlyDelete(req.user.userId, parseInt(id, 10));
  }
}
