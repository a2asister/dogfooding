import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadModule } from './upload/upload.module';
import { WorkModule } from './work/work.module';
import { StatsModule } from './stats/stats.module';
import { Upload } from './upload/upload.entity';
import { Work } from './work/work.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'pixel-particle.db',
      entities: [Upload, Work],
      synchronize: true,
    }),
    UploadModule,
    WorkModule,
    StatsModule,
  ],
})
export class AppModule {}
