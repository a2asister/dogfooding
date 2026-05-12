import { Controller, Post, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileEntity } from './file.entity';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('chunk/:fileId/:chunkIndex')
  @UseInterceptors(FileInterceptor('chunk'))
  async uploadChunk(
    @Param('fileId') fileId: string,
    @Param('chunkIndex') chunkIndex: string,
    @UploadedFile() chunk: Express.Multer.File,
  ): Promise<FileEntity> {
    if (typeof chunk === 'undefined' || chunk === null) {
      throw new BadRequestException('No chunk file provided');
    }

    const index = parseInt(chunkIndex, 10);
    if (isNaN(index)) {
      throw new BadRequestException('Invalid chunk index');
    }

    return this.fileService.uploadChunk(fileId, index, chunk.buffer);
  }
}
