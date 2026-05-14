import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from './entities/album.entity';
import { Photo } from './entities/photo.entity';
import { ViewHistory } from './entities/view-history.entity';
import { AlbumModule } from './album/album.module';
import { ViewHistoryModule } from './view-history/view-history.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'gallery.db',
      entities: [Album, Photo, ViewHistory],
      synchronize: true,
    }),
    AlbumModule,
    ViewHistoryModule,
  ],
})
export class AppModule {}
