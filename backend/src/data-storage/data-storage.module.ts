import { Module, Global } from '@nestjs/common';
import { DataStorageService } from './data-storage.service';

@Global()
@Module({
  providers: [DataStorageService],
  exports: [DataStorageService],
})
export class DataStorageModule {}
