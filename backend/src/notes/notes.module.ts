import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Note } from './entities/note.entity';
import { Tag } from '../tags/entities/tag.entity';
import { NoteVersion } from '../note-versions/entities/note-version.entity';
import { SyncRecord } from '../sync/entities/sync-record.entity';
import { EncryptionService } from '../common/services/encryption.service';

@Module({
  imports: [TypeOrmModule.forFeature([Note, Tag, NoteVersion, SyncRecord])],
  controllers: [NotesController],
  providers: [NotesService, EncryptionService],
  exports: [NotesService, TypeOrmModule],
})
export class NotesModule {}
