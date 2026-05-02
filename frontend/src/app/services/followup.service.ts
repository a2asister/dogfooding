import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Followup } from '../models/followup.model';

@Injectable({
  providedIn: 'root'
})
export class FollowupService {
  private apiUrl = 'http://localhost:58321/api/followups';

  constructor(private http: HttpClient) { }

  getFollowups(): Observable<Followup[]> {
    return this.http.get<Followup[]>(this.apiUrl);
  }

  getFollowupsByCustomer(customerId: string): Observable<Followup[]> {
    return this.http.get<Followup[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  createFollowup(followup: Omit<Followup, 'id' | 'createdAt'>): Observable<Followup> {
    return this.http.post<Followup>(this.apiUrl, followup);
  }
}
