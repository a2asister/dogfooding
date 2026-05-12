import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineModule } from './medicine/medicine.module';
import { ReminderModule } from './reminder/reminder.module';
import { Medicine } from './entities/medicine.entity';
import { MedicineRecord } from './entities/medicine-record.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'medicine.db',
      entities: [Medicine, MedicineRecord],
      synchronize: true,
    }),
    MedicineModule,
    ReminderModule,
  ],
})
export class AppModule {}
