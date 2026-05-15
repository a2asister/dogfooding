import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan, In } from 'typeorm';
import { FileItem } from '../entities/file.entity';
import { FileLock } from '../entities/file-lock.entity';
import { CreateFileDto, UpdateFileDto, MoveFileDto, CopyFileDto, BatchOperationDto, SortField, SortOrder } from './dto/files.dto';

@Injectable()
export class FilesService {
  private readonly LOCK_TIMEOUT = 30000;

  constructor(
    @InjectRepository(FileItem)
    private fileRepository: Repository<FileItem>,
    @InjectRepository(FileLock)
    private fileLockRepository: Repository<FileLock>,
  ) {}

  private async acquireLock(fileId: number, userId: number, operation: string): Promise<void> {
    await this.fileLockRepository.delete({
      fileId,
      expiresAt: MoreThan(new Date()),
    });

    const expiresAt = new Date(Date.now() + this.LOCK_TIMEOUT);
    const lock = this.fileLockRepository.create({
      fileId,
      userId,
      operation,
      expiresAt,
    });
    await this.fileLockRepository.save(lock);
  }

  private async releaseLock(fileId: number): Promise<void> {
    await this.fileLockRepository.delete({ fileId });
  }

  private async checkLock(fileId: number): Promise<boolean> {
    const existingLock = await this.fileLockRepository.findOne({
      where: {
        fileId,
        expiresAt: MoreThan(new Date()),
      },
    });
    return !!existingLock;
  }

  async getFiles(userId: number, parentId: number | null = null, sortField?: SortField, sortOrder?: SortOrder, includeDeleted: boolean = false) {
    const order: any = {};
    if (sortField && sortOrder) {
      order[sortField] = sortOrder;
    } else {
      order.type = 'ASC';
      order.name = 'ASC';
    }

    return this.fileRepository.find({
      where: {
        userId,
        parentId: parentId === null ? IsNull() : parentId,
        isDeleted: includeDeleted ? undefined : false,
      } as any,
      order,
    });
  }

  async getFileById(userId: number, fileId: number, includeDeleted: boolean = false) {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, isDeleted: includeDeleted ? undefined : false } as any,
    });

    if (!file) {
      throw new NotFoundException('文件不存在');
    }

    if (file.userId !== userId) {
      throw new ForbiddenException('无权限访问此文件');
    }

    return file;
  }

  async getFilePath(userId: number, fileId: number): Promise<string> {
    const file = await this.getFileById(userId, fileId);
    const path: string[] = [file.name];
    
    let currentId = file.parentId;
    while (currentId !== null) {
      const parent = await this.fileRepository.findOne({
        where: { id: currentId, userId, isDeleted: false } as any,
      });
      if (parent) {
        path.unshift(parent.name);
        currentId = parent.parentId;
      } else {
        break;
      }
    }
    
    return '/' + path.join('/');
  }

  async getFileByPath(userId: number, path: string): Promise<FileItem> {
    const parts = path.split('/').filter(p => p);
    let currentParentId: number | null = null;
    
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const file = await this.fileRepository.findOne({
        where: {
          userId,
          name,
          parentId: currentParentId === null ? IsNull() : currentParentId,
          isDeleted: false,
        } as any,
      });
      
      if (!file) {
        throw new NotFoundException(`路径不存在: ${path}`);
      }
      
      if (i === parts.length - 1) {
        return file;
      }
      
      if (file.type !== 'folder') {
        throw new BadRequestException(`路径中 '${name}' 不是文件夹`);
      }
      
      currentParentId = file.id;
    }
    
    throw new NotFoundException(`路径不存在: ${path}`);
  }

  async createFile(userId: number, createFileDto: CreateFileDto) {
    if (createFileDto.parentId) {
      const parent = await this.getFileById(userId, createFileDto.parentId);
      if (parent.type !== 'folder') {
        throw new BadRequestException('目标不是文件夹');
      }
    }

    const existingFile = await this.fileRepository.findOne({
      where: {
        userId,
        name: createFileDto.name,
        parentId: createFileDto.parentId === undefined ? IsNull() : createFileDto.parentId,
        isDeleted: false,
      } as any,
    });

    if (existingFile) {
      throw new ConflictException('同名文件已存在');
    }

    const file = this.fileRepository.create({
      ...createFileDto,
      userId,
      content: createFileDto.content || null,
      parentId: createFileDto.parentId || null,
      size: createFileDto.content ? Buffer.byteLength(createFileDto.content) : 0,
    });

    return this.fileRepository.save(file);
  }

  async updateFile(userId: number, fileId: number, updateFileDto: UpdateFileDto) {
    const file = await this.getFileById(userId, fileId);

    if (await this.checkLock(fileId)) {
      throw new ConflictException('文件正在被操作，请稍后重试');
    }

    await this.acquireLock(fileId, userId, 'update');

    try {
      if (updateFileDto.name !== undefined) {
        file.name = updateFileDto.name;
      }
      if (updateFileDto.content !== undefined) {
        file.content = updateFileDto.content;
        file.size = updateFileDto.content ? Buffer.byteLength(updateFileDto.content) : 0;
      }
      if (updateFileDto.parentId !== undefined) {
        if (updateFileDto.parentId !== null) {
          const targetParent = await this.getFileById(userId, updateFileDto.parentId);
          if (targetParent.type !== 'folder') {
            throw new BadRequestException('目标不是文件夹');
          }
        }
        file.parentId = updateFileDto.parentId;
      }

      return await this.fileRepository.save(file);
    } finally {
      await this.releaseLock(fileId);
    }
  }

  async moveFile(userId: number, fileId: number, moveFileDto: MoveFileDto) {
    const file = await this.getFileById(userId, fileId);
    const targetParentId: number | null = moveFileDto.targetParentId ?? null;

    if (targetParentId !== null) {
      const targetParent = await this.getFileById(userId, targetParentId);
      if (targetParent.type !== 'folder') {
        throw new BadRequestException('目标不是文件夹');
      }
      
      if (file.type === 'folder') {
        let parentId: number | null = targetParent.id;
        while (parentId !== null) {
          if (parentId === fileId) {
            throw new BadRequestException('不能将文件夹移动到其子文件夹中');
          }
          const parent = await this.fileRepository.findOne({ where: { id: parentId, userId, isDeleted: false } as any });
          parentId = parent ? parent.parentId : null;
        }
      }
    }

    const existingFile = await this.fileRepository.findOne({
      where: {
        userId,
        name: file.name,
        parentId: targetParentId === null ? IsNull() : targetParentId,
        isDeleted: false,
      } as any,
    });

    if (existingFile) {
      throw new ConflictException('目标位置已存在同名文件');
    }

    file.parentId = targetParentId;
    return this.fileRepository.save(file);
  }

  private async copySingleFile(
    userId: number,
    sourceFile: FileItem,
    targetParentId: number | null,
    nameMap: Map<number, string>
  ): Promise<FileItem> {
    let newName = sourceFile.name;
    let counter = 1;
    
    while (true) {
      const existing = await this.fileRepository.findOne({
        where: {
          userId,
          name: newName,
          parentId: targetParentId === null ? IsNull() : targetParentId,
          isDeleted: false,
        } as any,
      });
      if (!existing) break;
      newName = `${sourceFile.name} (${counter++})`;
    }

    const newFile = this.fileRepository.create({
      name: newName,
      type: sourceFile.type,
      content: sourceFile.content,
      parentId: targetParentId,
      userId,
      size: sourceFile.size,
      mimeType: sourceFile.mimeType,
    });

    const savedFile = await this.fileRepository.save(newFile);
    nameMap.set(sourceFile.id, savedFile.name);

    if (sourceFile.type === 'folder') {
      const children = await this.fileRepository.find({
        where: { userId, parentId: sourceFile.id, isDeleted: false },
      });
      
      for (const child of children) {
        await this.copySingleFile(userId, child, savedFile.id, nameMap);
      }
    }

    return savedFile;
  }

  async copyFile(userId: number, fileId: number, copyFileDto: CopyFileDto) {
    const sourceFile = await this.getFileById(userId, fileId);
    const targetParentId: number | null = copyFileDto.targetParentId ?? null;
    
    if (targetParentId !== null) {
      const targetParent = await this.getFileById(userId, targetParentId);
      if (targetParent.type !== 'folder') {
        throw new BadRequestException('目标不是文件夹');
      }
    }

    const nameMap = new Map<number, string>();
    return this.copySingleFile(userId, sourceFile, targetParentId, nameMap);
  }

  async moveToTrash(userId: number, fileId: number) {
    const file = await this.getFileById(userId, fileId);

    if (await this.checkLock(fileId)) {
      throw new ConflictException('文件正在被操作，请稍后重试');
    }

    await this.acquireLock(fileId, userId, 'delete');

    try {
      const originalPath = await this.getFilePath(userId, fileId);

      const markAsDeleted = async (f: FileItem) => {
        f.isDeleted = true;
        f.deletedAt = new Date();
        f.originalPath = originalPath;
        await this.fileRepository.save(f);

        if (f.type === 'folder') {
          const children = await this.fileRepository.find({
            where: { userId, parentId: f.id, isDeleted: false },
          });
          for (const child of children) {
            await markAsDeleted(child);
          }
        }
      };

      await markAsDeleted(file);
      
      return { message: '已移入回收站' };
    } finally {
      await this.releaseLock(fileId);
    }
  }

  async getTrash(userId: number) {
    return this.fileRepository.find({
      where: { userId, isDeleted: true },
      order: { deletedAt: 'DESC' },
    });
  }

  async restoreFromTrash(userId: number, fileId: number, targetParentId?: number) {
    const file = await this.getFileById(userId, fileId, true);
    
    if (!file.isDeleted) {
      throw new BadRequestException('文件不在回收站中');
    }

    let restoreParentId = targetParentId ?? file.parentId;

    if (restoreParentId !== null) {
      const targetParent = await this.fileRepository.findOne({
        where: { id: restoreParentId, userId, isDeleted: false } as any,
      });
      if (!targetParent) {
        restoreParentId = null;
      }
    }

    const existingFile = await this.fileRepository.findOne({
      where: {
        userId,
        name: file.name,
        parentId: restoreParentId === null ? IsNull() : restoreParentId,
        isDeleted: false,
      } as any,
    });

    if (existingFile) {
      let counter = 1;
      let newName: string;
      do {
        newName = `${file.name} (${counter++})`;
      } while (await this.fileRepository.findOne({
        where: {
          userId,
          name: newName,
          parentId: restoreParentId === null ? IsNull() : restoreParentId,
          isDeleted: false,
        } as any,
      }));
      file.name = newName;
    }

    const restoreFile = async (f: FileItem, newParentId: number | null) => {
      f.isDeleted = false;
      f.deletedAt = null;
      f.parentId = newParentId;
      f.originalPath = null;
      await this.fileRepository.save(f);

      if (f.type === 'folder') {
        const children = await this.fileRepository.find({
          where: { userId, parentId: f.id, isDeleted: true },
        });
        for (const child of children) {
          await restoreFile(child, f.id);
        }
      }
    };

    await restoreFile(file, restoreParentId);
    
    return file;
  }

  async permanentlyDelete(userId: number, fileId: number) {
    const file = await this.getFileById(userId, fileId, true);

    const deleteRecursive = async (f: FileItem) => {
      if (f.type === 'folder') {
        const children = await this.fileRepository.find({
          where: { userId, parentId: f.id },
        });
        for (const child of children) {
          await deleteRecursive(child);
        }
      }
      await this.fileRepository.delete(f.id);
    };

    await deleteRecursive(file);
    return { message: '永久删除成功' };
  }

  async emptyTrash(userId: number) {
    const trashFiles = await this.fileRepository.find({
      where: { userId, isDeleted: true },
    });

    for (const file of trashFiles) {
      await this.permanentlyDelete(userId, file.id);
    }

    return { message: '回收站已清空', count: trashFiles.length };
  }

  async batchOperation(userId: number, batchDto: BatchOperationDto) {
    const results: Array<{ fileId: number; success: boolean; error?: string }> = [];

    for (const fileId of batchDto.fileIds) {
      try {
        switch (batchDto.operation) {
          case 'delete':
            await this.moveToTrash(userId, fileId);
            break;
          case 'move':
            if (batchDto.targetParentId === undefined) {
              throw new BadRequestException('移动操作需要目标文件夹ID');
            }
            await this.moveFile(userId, fileId, { targetParentId: batchDto.targetParentId });
            break;
          case 'copy':
            if (batchDto.targetParentId === undefined) {
              throw new BadRequestException('复制操作需要目标文件夹ID');
            }
            await this.copyFile(userId, fileId, { targetParentId: batchDto.targetParentId });
            break;
          case 'restore':
            await this.restoreFromTrash(userId, fileId, batchDto.targetParentId);
            break;
          default:
            throw new BadRequestException('不支持的操作类型');
        }
        results.push({ fileId, success: true });
      } catch (error: any) {
        results.push({ fileId, success: false, error: error.message });
      }
    }

    return {
      total: batchDto.fileIds.length,
      successCount: results.filter(r => r.success).length,
      results,
    };
  }

  async sortFiles(userId: number, parentId: number | null, field: SortField, order: SortOrder) {
    return this.getFiles(userId, parentId, field, order);
  }
}
