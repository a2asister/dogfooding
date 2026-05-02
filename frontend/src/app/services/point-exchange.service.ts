import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface PointExchange {
  id?: string;
  memberId: string;
  giftBoxId: string;
  pointsUsed: number;
  exchangeDate?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PointExchangeService {
  constructor(private api: ApiService) { }

  getExchanges(): Observable<{ success: boolean; data: PointExchange[] }> {
    return this.api.get('/point-exchanges');
  }

  createExchange(exchange: PointExchange): Observable<{ success: boolean; data: PointExchange }> {
    return this.api.post('/point-exchanges', exchange);
  }
}
