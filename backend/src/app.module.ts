import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterModule } from './character/character.module';
import { PracticeModule } from './practice/practice.module';
import { NoteModule } from './note/note.module';
import { Character } from './entities/character.entity';
import { Radical } from './entities/radical.entity';
import { PracticeRecord } from './entities/practice-record.entity';
import { ErrorCharacter } from './entities/error-character.entity';
import { Note } from './entities/note.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Character, Radical, PracticeRecord, ErrorCharacter, Note],
      synchronize: true,
    }),
    CharacterModule,
    PracticeModule,
    NoteModule,
  ],
})
export class AppModule {}
