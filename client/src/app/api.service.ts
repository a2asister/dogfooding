import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface SavedFormula {
  id: string;
  name: string;
  expression: string;
  createdAt: number;
}

export interface AppSettings {
  precision: number;
  angleMode: 'deg' | 'rad';
  darkMode: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:4000/api';

  constructor(private http: HttpClient) {}

  getHistory(): Observable<CalculationHistory[]> {
    return this.http.get<CalculationHistory[]>(`${this.baseUrl}/history`);
  }

  addHistory(expression: string, result: string): Observable<CalculationHistory> {
    return this.http.post<CalculationHistory>(`${this.baseUrl}/history`, {
      expression,
      result,
    });
  }

  clearHistory(): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/history`);
  }

  deleteHistoryItem(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/history/${id}`);
  }

  getFormulas(): Observable<SavedFormula[]> {
    return this.http.get<SavedFormula[]>(`${this.baseUrl}/formulas`);
  }

  addFormula(name: string, expression: string): Observable<SavedFormula> {
    return this.http.post<SavedFormula>(`${this.baseUrl}/formulas`, {
      name,
      expression,
    });
  }

  deleteFormula(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/formulas/${id}`);
  }

  getSettings(): Observable<AppSettings> {
    return this.http.get<AppSettings>(`${this.baseUrl}/settings`);
  }

  updateSettings(partial: Partial<AppSettings>): Observable<AppSettings> {
    return this.http.patch<AppSettings>(`${this.baseUrl}/settings`, partial);
  }
}
