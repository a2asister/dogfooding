import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { FileItem } from '../entities/file.entity';
import { CreateFileDto, UpdateFileDto } from './dto/files.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileItem)
    private fileRepository: Repository<FileItem>,
  ) {}

  async getFiles(userId: number, parentId: number | null = null) {
    return this.fileRepository.find({
      where: {
        userId,
        parentId: parentId === null ? IsNull() : parentId,
      } as any,
      order: { type: 'ASC', name: 'ASC' },
    });
  }

  async getFileById(userId: number, fileId: number) {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('文件不存在');
    }

    if (file.userId !== userId) {
      throw new ForbiddenException('无权限访问此文件');
    }

    return file;
  }

  async createFile(userId: number, createFileDto: CreateFileDto) {
    const file = this.fileRepository.create({
      ...createFileDto,
      userId,
      content: createFileDto.content || null,
      parentId: createFileDto.parentId || null,
    });

    return this.fileRepository.save(file);
  }

  async updateFile(userId: number, fileId: number, updateFileDto: UpdateFileDto) {
    const file = await this.getFileById(userId, fileId);

    if (updateFileDto.name !== undefined) {
      file.name = updateFileDto.name;
    }
    if (updateFileDto.content !== undefined) {
      file.content = updateFileDto.content;
    }

    return this.fileRepository.save(file);
  }

  async deleteFile(userId: number, fileId: number) {
    const file = await this.getFileById(userId, fileId);

    if (file.type === 'folder') {
      const childFiles = await this.fileRepository.find({
        where: { userId, parentId: fileId },
      });
      for (const childFile of childFiles) {
        await this.deleteFile(userId, childFile.id);
      }
    }

    await this.fileRepository.delete(fileId);
    return { message: '删除成功' };
  }
}