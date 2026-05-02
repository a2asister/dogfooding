import { Pipe, PipeTransform } from '@angular/core';
import { ApplicationStatus } from '../types';

@Pipe({
  name: 'statusBadge',
  standalone: true
})
export class StatusBadgePipe implements PipeTransform {

  transform(status: ApplicationStatus | 'locked' | 'unlocked'): { class: string; text: string } {
    const statusMap: Record<string, { class: string; text: string }> = {
      'draft': { class: 'badge-draft', text: '草稿' },
      'pending': { class: 'badge-pending', text: '待审核' },
      'approved': { class: 'badge-approved', text: '已通过' },
      'rejected': { class: 'badge-rejected', text: '已拒绝' },
      'locked': { class: 'badge-locked', text: '已锁定' },
      'unlocked': { class: 'badge-unlocked', text: '正常' }
    };
    
    return statusMap[status] || { class: 'badge-draft', text: status };
  }
}
