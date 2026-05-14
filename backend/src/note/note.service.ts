import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../entities/note.entity';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
  ) {}

  async create(noteData: Omit<Note, 'id'>): Promise<Note> {
    const note = this.noteRepository.create(noteData);
    return this.noteRepository.save(note);
  }

  async findAll(): Promise<Note[]> {
    return this.noteRepository.find({ order: { timestamp: 'DESC' } });
  }

  async findByCharacterId(characterId: string): Promise<Note[]> {
    return this.noteRepository.find({
      where: { characterId },
      order: { timestamp: 'DESC' },
    });
  }

  async update(id: string, content: string): Promise<Note | null> {
    const note = await this.noteRepository.findOne({ where: { id } });
    if (!note) {
      return null;
    }
    note.content = content;
    note.timestamp = Date.now();
    return this.noteRepository.save(note);
  }

  async delete(id: string): Promise<void> {
    await this.noteRepository.delete(id);
  }
}
