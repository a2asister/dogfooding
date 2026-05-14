import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SavedWork } from './entities/saved-work.entity';
import { Template } from './entities/template.entity';
import { CreationRecord } from './entities/creation-record.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'geometric-fission.db',
      entities: [SavedWork, Template, CreationRecord],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([SavedWork, Template, CreationRecord]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
