import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PathEntity } from './entities/path.entity';
import { PointEntity } from './entities/point.entity';
import { PathVersionEntity } from './entities/path-version.entity';
import { HistoryEntity } from './entities/history.entity';
import { PathService } from './services/path.service';
import { VersionService } from './services/version.service';
import { HistoryService } from './services/history.service';
import { AlgorithmService } from './services/algorithm.service';
import { ConfigService } from './services/config.service';
import { PathController } from './controllers/path.controller';
import { VersionController } from './controllers/version.controller';
import { HistoryController } from './controllers/history.controller';
import { AlgorithmController } from './controllers/algorithm.controller';
import { ConfigController } from './controllers/config.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'path-editor.db',
      entities: [PathEntity, PointEntity, PathVersionEntity, HistoryEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([PathEntity, PointEntity, PathVersionEntity, HistoryEntity]),
  ],
  controllers: [PathController, VersionController, HistoryController, AlgorithmController, ConfigController],
  providers: [PathService, VersionService, HistoryService, AlgorithmService, ConfigService],
})
export class AppModule {}