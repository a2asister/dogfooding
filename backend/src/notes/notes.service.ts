import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Note } from './entities/note.entity';
import { Tag } from '../tags/entities/tag.entity';
import { NoteVersion } from '../note-versions/entities/note-version.entity';
import { SyncRecord, SyncAction, SyncStatus } from '../sync/entities/sync-record.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { EncryptionService } from '../common/services/encryption.service';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
    @InjectRepository(NoteVersion)
    private noteVersionsRepository: Repository<NoteVersion>,
    @InjectRepository(SyncRecord)
    private syncRecordsRepository: Repository<SyncRecord>,
    private encryptionService: EncryptionService,
  ) {}

  async create(userId: number, createNoteDto: CreateNoteDto): Promise<Note> {
    const { title, content, categoryId, tagIds, isEncrypted } = createNoteDto;

    let processedTitle = title;
    let processedContent = content;
    let encryptionIv: string | null = null;

    if (isEncrypted && content) {
      const { encryptedText, iv } = this.encryptionService.encrypt(content);
      processedContent = encryptedText;
      encryptionIv = iv;
    }

    const note = this.notesRepository.create({
      userId,
      title: processedTitle,
      content: processedContent,
      categoryId: categoryId || null,
      isEncrypted: isEncrypted || false,
      encryptionIv,
    });

    if (tagIds && tagIds.length > 0) {
      const tags = await this.tagsRepository.find({
        where: { id: In(tagIds), userId },
      });
      note.tags = tags;
    }

    const savedNote = await this.notesRepository.save(note);

    await this.createNoteVersion(savedNote, 1);
    await this.createSyncRecord(userId, savedNote.id, SyncAction.CREATE);

    return this.decryptNoteIfNeeded(savedNote);
  }

  async findAll(userId: number): Promise<Note[]> {
    const notes = await this.notesRepository.find({
      where: { userId },
      relations: ['category', 'tags'],
      order: { updatedAt: 'DESC' },
    });

    return notes.map(note => this.decryptNoteIfNeeded(note));
  }

  async findOne(userId: number, id: number): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id, userId },
      relations: ['category', 'tags', 'versions'],
    });

    if (!note) {
      throw new NotFoundException('笔记不存在');
    }

    return this.decryptNoteIfNeeded(note);
  }

  async update(userId: number, id: number, updateNoteDto: UpdateNoteDto): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id, userId },
      relations: ['tags'],
    });

    if (!note) {
      throw new NotFoundException('笔记不存在');
    }

    const { title, content, categoryId, tagIds, isEncrypted } = updateNoteDto;

    if (title !== undefined) {
      note.title = title;
    }

    if (content !== undefined) {
      if (isEncrypted || note.isEncrypted) {
        const { encryptedText, iv } = this.encryptionService.encrypt(content);
        note.content = encryptedText;
        note.encryptionIv = iv;
        note.isEncrypted = true;
      } else {
        note.content = content;
        note.isEncrypted = false;
        note.encryptionIv = null;
      }
    }

    if (categoryId !== undefined) {
      note.categoryId = categoryId || null;
    }

    if (tagIds !== undefined) {
      if (tagIds.length === 0) {
        note.tags = [];
      } else {
        const tags = await this.tagsRepository.find({
          where: { id: In(tagIds), userId },
        });
        note.tags = tags;
      }
    }

    const currentVersion = await this.noteVersionsRepository.count({
      where: { noteId: id },
    });

    const updatedNote = await this.notesRepository.save(note);
    await this.createNoteVersion(updatedNote, currentVersion + 1);
    await this.createSyncRecord(userId, updatedNote.id, SyncAction.UPDATE);

    return this.decryptNoteIfNeeded(updatedNote);
  }

  async remove(userId: number, id: number): Promise<void> {
    const note = await this.notesRepository.findOne({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundException('笔记不存在');
    }

    await this.notesRepository.remove(note);
    await this.createSyncRecord(userId, id, SyncAction.DELETE);
  }

  async search(userId: number, query: string): Promise<Note[]> {
    const notes = await this.notesRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.category', 'category')
      .leftJoinAndSelect('note.tags', 'tags')
      .where('note.userId = :userId', { userId })
      .andWhere(
        '(note.title LIKE :query OR note.content LIKE :query)',
        { query: `%${query}%` }
      )
      .orderBy('note.updatedAt', 'DESC')
      .getMany();

    return notes.map(note => this.decryptNoteIfNeeded(note));
  }

  async findByCategory(userId: number, categoryId: number): Promise<Note[]> {
    const notes = await this.notesRepository.find({
      where: { userId, categoryId },
      relations: ['category', 'tags'],
      order: { updatedAt: 'DESC' },
    });

    return notes.map(note => this.decryptNoteIfNeeded(note));
  }

  async findByTag(userId: number, tagId: number): Promise<Note[]> {
    const notes = await this.notesRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.category', 'category')
      .leftJoinAndSelect('note.tags', 'tags')
      .where('note.userId = :userId', { userId })
      .andWhere('tags.id = :tagId', { tagId })
      .orderBy('note.updatedAt', 'DESC')
      .getMany();

    return notes.map(note => this.decryptNoteIfNeeded(note));
  }

  async findByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Note[]> {
    const notes = await this.notesRepository.find({
      where: {
        userId,
        createdAt: Between(startDate, endDate),
      },
      relations: ['category', 'tags'],
      order: { createdAt: 'DESC' },
    });

    return notes.map(note => this.decryptNoteIfNeeded(note));
  }

  async getArchiveByMonth(userId: number): Promise<{ year: number; month: number; count: number }[]> {
    const result = await this.notesRepository
      .createQueryBuilder('note')
      .select('YEAR(note.createdAt)', 'year')
      .addSelect('MONTH(note.createdAt)', 'month')
      .addSelect('COUNT(note.id)', 'count')
      .where('note.userId = :userId', { userId })
      .groupBy('YEAR(note.createdAt), MONTH(note.createdAt)')
      .orderBy('YEAR(note.createdAt)', 'DESC')
      .addOrderBy('MONTH(note.createdAt)', 'DESC')
      .getRawMany();

    return result.map(item => ({
      year: parseInt(item.year),
      month: parseInt(item.month),
      count: parseInt(item.count),
    }));
  }

  private async createNoteVersion(note: Note, version: number): Promise<void> {
    const noteVersion = this.noteVersionsRepository.create({
      noteId: note.id,
      userId: note.userId,
      title: note.title,
      content: note.content,
      isEncrypted: note.isEncrypted,
      encryptionIv: note.encryptionIv,
      version,
    });

    await this.noteVersionsRepository.save(noteVersion);
  }

  private async createSyncRecord(
    userId: number,
    noteId: number,
    action: SyncAction
  ): Promise<void> {
    const syncRecord = this.syncRecordsRepository.create({
      userId,
      noteId,
      action,
      syncStatus: SyncStatus.SUCCESS,
    });

    await this.syncRecordsRepository.save(syncRecord);
  }

  private decryptNoteIfNeeded(note: Note): Note {
    if (note.isEncrypted && note.content && note.encryptionIv) {
      try {
        note.content = this.encryptionService.decrypt(note.content, note.encryptionIv);
      } catch (e) {
        // 解密失败时保持加密状态
      }
    }
    return note;
  }
}
