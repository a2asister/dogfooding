import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FileItem } from '../entities/file.entity';
import { FileLock } from '../entities/file-lock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileItem, FileLock])],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}