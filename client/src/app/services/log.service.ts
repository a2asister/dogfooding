import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AuditLog {
  id: string;
  contentId: string;
  contentTitle: string;
  action: 'approve' | 'reject' | 'review';
  auditor: string;
  reason: string;
  createdAt: string;
}

export interface DailyStats {
  date: string;
  total: number;
  approved: number;
  rejected: number;
  reviewed: number;
}

export interface ComplianceStats {
  complianceRate: number;
  totalAudited: number;
  approved: number;
  rejected: number;
  avgResponseTime: number;
  activeRules: number;
  totalRules: number;
  pendingContents: number;
  highRiskContents: number;
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  constructor(private api: ApiService) {}

  getLogs(params?: {
    auditor?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Observable<{ success: boolean; data: { items: AuditLog[]; total: number; page: number; pageSize: number } }> {
    return this.api.get('/logs', params);
  }

  getDailyStats(days: number = 7): Observable<{ success: boolean; data: DailyStats[] }> {
    return this.api.get('/logs/stats/daily', { days });
  }

  getComplianceStats(): Observable<{ success: boolean; data: ComplianceStats }> {
    return this.api.get('/logs/stats/compliance');
  }
}
