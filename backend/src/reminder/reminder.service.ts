import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MedicineService } from '../medicine/medicine.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(private medicineService: MedicineService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkMedicines() {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    this.logger.log(`Checking medicines at ${currentTime}`);
    
    const medicines = await this.medicineService.findAll();
    
    for (const medicine of medicines) {
      if (medicine.time === currentTime) {
        this.logger.log(`Reminder: 请服用 ${medicine.name}!`);
        await this.medicineService.createRecord(medicine.id, medicine.time);
      }
    }
  }
}
