import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckinEntity } from '../entities/checkin.entity';

interface UserStats {
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  streak: number;
}

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(CheckinEntity)
    private checkinRepository: Repository<CheckinEntity>,
  ) {}

  async getUserStats(): Promise<UserStats> {
    const checkins = await this.checkinRepository.find({
      order: { date: 'DESC' },
    });

    const totalWorkouts = checkins.length;
    const totalDuration = checkins.reduce((sum, c) => sum + c.duration, 0);
    const totalCalories = Math.round(totalDuration * 6.5);
    const streak = this.calculateStreak(checkins);

    return {
      totalWorkouts,
      totalDuration,
      totalCalories,
      streak,
    };
  }

  private calculateStreak(checkins: CheckinEntity[]): number {
    if (checkins.length === 0) return 0;
    
    const uniqueDates = new Set(checkins.map(c => c.date));
    const sortedDates = Array.from(uniqueDates).sort().reverse();
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const checkinDate = new Date(sortedDates[i]!);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (this.isSameDay(checkinDate, expectedDate)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}
