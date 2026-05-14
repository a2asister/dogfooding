import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { NoteService } from './note.service';
import { Note } from '../entities/note.entity';

@Controller('api/notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  async create(@Body() noteData: Omit<Note, 'id'>): Promise<Note> {
    return this.noteService.create(noteData);
  }

  @Get()
  async findAll(): Promise<Note[]> {
    return this.noteService.findAll();
  }

  @Get('character/:characterId')
  async findByCharacterId(@Param('characterId') characterId: string): Promise<Note[]> {
    return this.noteService.findByCharacterId(characterId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body('content') content: string): Promise<Note | null> {
    return this.noteService.update(id, content);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.noteService.delete(id);
  }
}
