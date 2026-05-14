import { Controller, Post, Get, Put, Delete, Param, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    return this.uploadService.create(file, body.params ? JSON.parse(body.params) : null);
  }

  @Get()
  async findAll() {
    return this.uploadService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.uploadService.findOne(+id);
  }

  @Put(':id/params')
  async updateParams(@Param('id') id: string, @Body() params: any) {
    return this.uploadService.updateParams(+id, params);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.uploadService.delete(+id);
  }
}
