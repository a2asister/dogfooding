import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Rule {
  id: string;
  name: string;
  category: string;
  description: string;
  keywords: string[];
  riskLevel: 'high' | 'medium' | 'low';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class RuleService {
  constructor(private api: ApiService) {}

  getRules(params?: {
    category?: string;
    enabled?: boolean;
    search?: string;
  }): Observable<{ success: boolean; data: Rule[] }> {
    return this.api.get('/rules', params);
  }

  getRule(id: string): Observable<{ success: boolean; data: Rule }> {
    return this.api.get(`/rules/${id}`);
  }

  createRule(data: Partial<Rule>): Observable<{ success: boolean; data: Rule }> {
    return this.api.post('/rules', data);
  }

  updateRule(id: string, data: Partial<Rule>): Observable<{ success: boolean; data: Rule }> {
    return this.api.put(`/rules/${id}`, data);
  }

  deleteRule(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete(`/rules/${id}`);
  }

  getCategories(): Observable<{ success: boolean; data: string[] }> {
    return this.api.get('/rules/categories/list');
  }
}
