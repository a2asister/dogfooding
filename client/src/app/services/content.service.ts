import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ContentItem {
  id: string;
  type: 'article' | 'attachment' | 'comment' | 'announcement';
  title: string;
  content: string;
  author: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  createdAt: string;
  riskLevel: 'low' | 'medium' | 'high';
  autoAuditResult?: {
    violations: string[];
    confidence: number;
  };
  auditResult?: {
    action: string;
    reason: string;
    auditor: string;
    auditedAt: string;
  };
  fileName?: string;
  fileSize?: number;
}

export interface ContentStats {
  total: number;
  pending: number;
  reviewing: number;
  approved: number;
  rejected: number;
  byType: {
    article: number;
    attachment: number;
    comment: number;
    announcement: number;
  };
  byRisk: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  constructor(private api: ApiService) {}

  getContents(params?: {
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Observable<{ success: boolean; data: PaginatedResponse<ContentItem> }> {
    return this.api.get('/contents', params);
  }

  getContent(id: string): Observable<{ success: boolean; data: ContentItem }> {
    return this.api.get(`/contents/${id}`);
  }

  createContent(data: Partial<ContentItem>): Observable<{ success: boolean; data: ContentItem }> {
    return this.api.post('/contents', data);
  }

  auditContent(id: string, data: {
    action: 'approve' | 'reject' | 'review';
    reason?: string;
    auditor: string;
  }): Observable<{ success: boolean; data: ContentItem }> {
    return this.api.put(`/contents/${id}/audit`, data);
  }

  getStats(): Observable<{ success: boolean; data: ContentStats }> {
    return this.api.get('/contents/stats/summary');
  }
}
