import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Opportunity } from '../models/opportunity.model';

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {
  private apiUrl = 'http://localhost:58321/api/opportunities';

  constructor(private http: HttpClient) { }

  getOpportunities(): Observable<Opportunity[]> {
    return this.http.get<Opportunity[]>(this.apiUrl);
  }

  getOpportunity(id: string): Observable<Opportunity> {
    return this.http.get<Opportunity>(`${this.apiUrl}/${id}`);
  }

  createOpportunity(opportunity: Omit<Opportunity, 'id' | 'createdAt'>): Observable<Opportunity> {
    return this.http.post<Opportunity>(this.apiUrl, opportunity);
  }

  updateOpportunity(id: string, opportunity: Partial<Opportunity>): Observable<Opportunity> {
    return this.http.put<Opportunity>(`${this.apiUrl}/${id}`, opportunity);
  }

  deleteOpportunity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
