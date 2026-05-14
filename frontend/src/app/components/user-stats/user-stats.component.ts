import { Component, Input } from '@angular/core';
import { UserStats, CheckinRecord } from '../../services/api.service';

type StatKey = keyof UserStats;

@Component({
  selector: 'app-user-stats',
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.css']
})
export class UserStatsComponent {
  @Input() stats: UserStats = { totalWorkouts: 0, totalDuration: 0, totalCalories: 0, streak: 0 };
  @Input() checkinRecords: CheckinRecord[] = [];

  private readonly statConfig: { key: StatKey; icon: string; label: string }[] = [
    { key: 'totalWorkouts', icon: '🏋️', label: '训练次数' },
    { key: 'totalDuration', icon: '⏱', label: '总时长(分钟)' },
    { key: 'totalCalories', icon: '🔥', label: '消耗卡路里' },
    { key: 'streak', icon: '🔥', label: '连续打卡' }
  ];

  getStatConfig(): { key: StatKey; icon: string; label: string }[] {
    return this.statConfig;
  }

  getStatValue(key: StatKey): number {
    return this.stats[key];
  }
}
