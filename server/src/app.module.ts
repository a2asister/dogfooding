import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CharacterModule } from './character/character.module';
import { CollectionModule } from './collection/collection.module';
import { Character } from './character/character.entity';
import { Collection } from './collection/collection.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: './data/game.db',
      entities: [Character, Collection],
      synchronize: true,
    }),
    CharacterModule,
    CollectionModule,
  ],
})
export class AppModule {}
