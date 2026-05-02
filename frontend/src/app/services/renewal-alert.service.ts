import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RenewalAlert } from '../models/renewal-alert.model';

@Injectable({
  providedIn: 'root'
})
export class RenewalAlertService {
  private apiUrl = 'http://localhost:58321/api/renewal-alerts';

  constructor(private http: HttpClient) { }

  getAlerts(): Observable<RenewalAlert[]> {
    return this.http.get<RenewalAlert[]>(this.apiUrl);
  }

  createAlert(alert: Omit<RenewalAlert, 'id' | 'createdAt'>): Observable<RenewalAlert> {
    return this.http.post<RenewalAlert>(this.apiUrl, alert);
  }

  updateAlert(id: string, alert: Partial<RenewalAlert>): Observable<RenewalAlert> {
    return this.http.put<RenewalAlert>(`${this.apiUrl}/${id}`, alert);
  }
}
