import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as entities from './entities';
import { ElementModule } from './element/element.module';
import { FavoriteModule } from './favorite/favorite.module';
import { NoteModule } from './note/note.module';
import { KnowledgeCategoryModule } from './knowledge-category/knowledge-category.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: Object.values(entities),
      synchronize: true,
      logging: false,
    }),
    ElementModule,
    FavoriteModule,
    NoteModule,
    KnowledgeCategoryModule,
  ],
})
export class AppModule {}
