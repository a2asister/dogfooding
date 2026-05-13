import {
  Controller,
  Post,
  UploadedFile,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudioService } from './audio.service';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('upload/:projectId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    return this.audioService.uploadAudio(projectId, file);
  }
}
