import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity, FileStatus } from './file.entity';
import { CreateFileInput } from './dto/create-file.input';
import { createWriteStream, existsSync, mkdirSync, promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

@Injectable()
export class FileService {
  private chunkStreams: Map<string, Map<number, Buffer>> = new Map();

  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
  ) {
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  async createFile(input: CreateFileInput): Promise<FileEntity> {
    const file = this.fileRepository.create({
      ...input,
      filename: uuidv4() + '-' + input.filename,
    });
    await this.fileRepository.save(file);
    this.chunkStreams.set(file.id, new Map());
    return file;
  }

  async uploadChunk(fileId: string, chunkIndex: number, chunkData: Buffer): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.status === FileStatus.COMPLETED) {
      throw new BadRequestException('File already completed');
    }

    const chunkMap = this.chunkStreams.get(fileId);
    if (!chunkMap) {
      throw new BadRequestException('Upload session expired');
    }

    chunkMap.set(chunkIndex, chunkData);
    file.uploadedChunks = chunkMap.size;

    if (file.uploadedChunks === file.totalChunks) {
      await this.assembleFile(file);
    }

    await this.fileRepository.save(file);
    return file;
  }

  private async assembleFile(file: FileEntity): Promise<void> {
    const chunkMap = this.chunkStreams.get(file.id);
    if (!chunkMap) {
      return Promise.resolve();
    }

    const filePath = join(UPLOAD_DIR, file.filename);
    const writeStream = createWriteStream(filePath);

    for (let i = 0; i < file.totalChunks; i++) {
      const chunk = chunkMap.get(i);
      if (chunk) {
        writeStream.write(chunk);
      }
    }

    writeStream.end();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', async () => {
        file.status = FileStatus.COMPLETED;
        file.filePath = filePath;
        this.chunkStreams.delete(file.id);
        await this.fileRepository.save(file);
        resolve();
      });
      writeStream.on('error', async (error) => {
        file.status = FileStatus.FAILED;
        await this.fileRepository.save(file);
        reject(error);
      });
    });
  }

  async getFile(id: string): Promise<FileEntity | null> {
    return this.fileRepository.findOne({ where: { id } });
  }

  async getFiles(): Promise<FileEntity[]> {
    return this.fileRepository.find({ order: { createdAt: 'DESC' } });
  }

  async deleteFile(id: string): Promise<boolean> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (typeof file.filePath !== 'undefined' && file.filePath !== null && existsSync(file.filePath)) {
      await fs.unlink(file.filePath);
    }

    await this.fileRepository.delete(id);
    return true;
  }

  getUploadProgress(file: FileEntity): number {
    if (file.totalChunks === 0) return 0;
    return Math.round((file.uploadedChunks / file.totalChunks) * 100);
  }
}
