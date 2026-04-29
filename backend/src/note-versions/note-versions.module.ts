import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteVersionsService } from './note-versions.service';
import { NoteVersionsController } from './note-versions.controller';
import { NoteVersion } from './entities/note-version.entity';
import { EncryptionService } from '../common/services/encryption.service';

@Module({
  imports: [TypeOrmModule.forFeature([NoteVersion])],
  controllers: [NoteVersionsController],
  providers: [NoteVersionsService, EncryptionService],
  exports: [NoteVersionsService, TypeOrmModule],
})
export class NoteVersionsModule {}
