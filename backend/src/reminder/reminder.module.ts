import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReminderService } from './reminder.service';
import { MedicineModule } from '../medicine/medicine.module';

@Module({
  imports: [ScheduleModule.forRoot(), MedicineModule],
  providers: [ReminderService],
})
export class ReminderModule {}
