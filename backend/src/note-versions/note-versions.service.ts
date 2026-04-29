import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteVersion } from './entities/note-version.entity';
import { EncryptionService } from '../common/services/encryption.service';

@Injectable()
export class NoteVersionsService {
  constructor(
    @InjectRepository(NoteVersion)
    private noteVersionsRepository: Repository<NoteVersion>,
    private encryptionService: EncryptionService,
  ) {}

  async findByNoteId(userId: number, noteId: number): Promise<NoteVersion[]> {
    const versions = await this.noteVersionsRepository.find({
      where: { noteId, userId },
      order: { version: 'DESC' },
    });

    return versions.map(version => this.decryptVersionIfNeeded(version));
  }

  async findOne(userId: number, noteId: number, version: number): Promise<NoteVersion> {
    const noteVersion = await this.noteVersionsRepository.findOne({
      where: { noteId, userId, version },
    });

    if (!noteVersion) {
      throw new NotFoundException('版本不存在');
    }

    return this.decryptVersionIfNeeded(noteVersion);
  }

  async restoreVersion(
    userId: number,
    noteId: number,
    version: number
  ): Promise<NoteVersion> {
    const noteVersion = await this.noteVersionsRepository.findOne({
      where: { noteId, userId, version },
    });

    if (!noteVersion) {
      throw new NotFoundException('版本不存在');
    }

    return this.decryptVersionIfNeeded(noteVersion);
  }

  private decryptVersionIfNeeded(version: NoteVersion): NoteVersion {
    if (version.isEncrypted && version.content && version.encryptionIv) {
      try {
        version.content = this.encryptionService.decrypt(version.content, version.encryptionIv);
      } catch (e) {
        // 解密失败时保持加密状态
      }
    }
    return version;
  }
}
