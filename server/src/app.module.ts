import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataService } from './data/data.service';
import { HistoryController } from './history/history.controller';
import { FormulasController } from './formulas/formulas.controller';
import { SettingsController } from './settings/settings.controller';

@Module({
  imports: [],
  controllers: [
    AppController,
    HistoryController,
    FormulasController,
    SettingsController,
  ],
  providers: [AppService, DataService],
})
export class AppModule {}
