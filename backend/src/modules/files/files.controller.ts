import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  Query,
  Req,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';
import { UsersService } from '../users/users.service';
import { Request } from 'express';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly usersService: UsersService,
  ) {}

  private async getCurrentUser(req: Request) {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      throw new NotFoundException('User not authenticated');
    }
    return this.usersService.findOne(userId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body('path') path: string = '/',
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const user = await this.getCurrentUser(req);
    const result = await this.filesService.uploadFile(
      user,
      file.buffer,
      file.originalname,
      path,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('download/:id')
  async downloadFile(
    @Req() req: Request,
    @Param('id') fileId: string,
    @Res() res: Response,
  ) {
    const user = await this.getCurrentUser(req);
    const { buffer, filename, mimeType } = await this.filesService.downloadFile(
      user,
      fileId,
    );
    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}"`,
    );
    res.send(buffer);
  }

  @Get()
  async getFiles(
    @Req() req: Request,
    @Query('path') path: string = '/',
  ) {
    const user = await this.getCurrentUser(req);
    const files = await this.filesService.getFiles(user, path);
    return {
      success: true,
      data: files,
    };
  }

  @Get('search')
  async searchFiles(
    @Req() req: Request,
    @Query('q') query: string,
  ) {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }
    const user = await this.getCurrentUser(req);
    const files = await this.filesService.searchFiles(user, query);
    return {
      success: true,
      data: files,
    };
  }

  @Get('sensitive')
  async getSensitiveFiles(@Req() req: Request) {
    const user = await this.getCurrentUser(req);
    const files = await this.filesService.getSensitiveFiles(user);
    return {
      success: true,
      data: files,
    };
  }

  @Get('stats')
  async getStorageStats(@Req() req: Request) {
    const user = await this.getCurrentUser(req);
    const stats = await this.filesService.getStorageStats(user);
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  async getFileById(@Req() req: Request, @Param('id') fileId: string) {
    const user = await this.getCurrentUser(req);
    const file = await this.filesService.getFileById(user, fileId);
    return {
      success: true,
      data: file,
    };
  }

  @Delete(':id')
  async deleteFile(@Req() req: Request, @Param('id') fileId: string) {
    const user = await this.getCurrentUser(req);
    const result = await this.filesService.deleteFile(user, fileId);
    return {
      success: true,
      data: { deleted: result },
    };
  }

  @Put(':id/rename')
  async renameFile(
    @Req() req: Request,
    @Param('id') fileId: string,
    @Body('name') newName: string,
  ) {
    if (!newName) {
      throw new BadRequestException('New name is required');
    }
    const user = await this.getCurrentUser(req);
    const result = await this.filesService.renameFile(user, fileId, newName);
    return {
      success: true,
      data: result,
    };
  }

  @Put(':id/move')
  async moveFile(
    @Req() req: Request,
    @Param('id') fileId: string,
    @Body('path') newPath: string,
  ) {
    if (!newPath) {
      throw new BadRequestException('New path is required');
    }
    const user = await this.getCurrentUser(req);
    const result = await this.filesService.moveFile(user, fileId, newPath);
    return {
      success: true,
      data: result,
    };
  }

  @Post(':id/sync-local')
  async syncToLocal(
    @Req() req: Request,
    @Param('id') fileId: string,
    @Body('localDir') localDir: string,
  ) {
    if (!localDir) {
      throw new BadRequestException('Local directory is required');
    }
    const user = await this.getCurrentUser(req);
    const result = await this.filesService.syncToLocal(user, fileId, localDir);
    return {
      success: true,
      data: result,
    };
  }
}
