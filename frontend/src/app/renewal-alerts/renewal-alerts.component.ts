import { Component, OnInit } from '@angular/core';
import { RenewalAlertService } from '../services/renewal-alert.service';
import { RenewalAlert } from '../models/renewal-alert.model';

@Component({
  selector: 'app-renewal-alerts',
  templateUrl: './renewal-alerts.component.html',
  styleUrl: './renewal-alerts.component.css'
})
export class RenewalAlertsComponent implements OnInit {
  alerts: RenewalAlert[] = [];
  loading = true;
  
  filterStatus = '';
  filterLevel = '';

  statusOptions = ['待处理', '处理中', '已完成', '已流失'];
  levelOptions = ['高', '中', '低'];

  constructor(private alertService: RenewalAlertService) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.alertService.getAlerts().subscribe({
      next: (alerts) => {
        this.alerts = alerts;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredAlerts(): RenewalAlert[] {
    return this.alerts.filter(item => {
      const matchesStatus = !this.filterStatus || item.status === this.filterStatus;
      const matchesLevel = !this.filterLevel || item.alertLevel === this.filterLevel;
      return matchesStatus && matchesLevel;
    });
  }

  get highPriorityCount(): number {
    return this.alerts.filter(a => a.alertLevel === '高' && a.status !== '已完成' && a.status !== '已流失').length;
  }

  get mediumPriorityCount(): number {
    return this.alerts.filter(a => a.alertLevel === '中' && a.status !== '已完成' && a.status !== '已流失').length;
  }

  get inProgressCount(): number {
    return this.alerts.filter(a => a.status === '处理中').length;
  }

  get completedCount(): number {
    return this.alerts.filter(a => a.status === '已完成').length;
  }

  getAlertLevelClass(level: string): string {
    switch (level) {
      case '高': return 'bg-red-100 text-red-800';
      case '中': return 'bg-yellow-100 text-yellow-800';
      case '低': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case '待处理': return 'bg-yellow-100 text-yellow-800';
      case '处理中': return 'bg-blue-100 text-blue-800';
      case '已完成': return 'bg-green-100 text-green-800';
      case '已流失': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  updateStatus(alert: RenewalAlert, newStatus: string): void {
    this.alertService.updateAlert(alert.id, { status: newStatus }).subscribe({
      next: () => {
        alert.status = newStatus;
      },
      error: () => {}
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}
