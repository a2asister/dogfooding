import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from './upload.entity';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
  ) {}

  async create(file: Express.Multer.File, params?: any) {
    const upload = new Upload();
    upload.filename = file.filename;
    upload.originalName = file.originalname;
    upload.mimeType = file.mimetype;
    upload.size = file.size;
    upload.params = params;
    return this.uploadRepository.save(upload);
  }

  async findAll() {
    return this.uploadRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    return this.uploadRepository.findOne({ where: { id } });
  }

  async updateParams(id: number, params: any) {
    await this.uploadRepository.update(id, { params });
    return this.findOne(id);
  }

  async delete(id: number) {
    return this.uploadRepository.delete(id);
  }
}
