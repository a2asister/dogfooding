import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface GiftBox {
  id?: string;
  name: string;
  description: string;
  pointsRequired: number;
  price: number;
  image?: string;
  createDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GiftBoxService {
  constructor(private api: ApiService) { }

  getGiftBoxes(): Observable<{ success: boolean; data: GiftBox[] }> {
    return this.api.get('/gift-boxes');
  }

  createGiftBox(giftBox: GiftBox): Observable<{ success: boolean; data: GiftBox }> {
    return this.api.post('/gift-boxes', giftBox);
  }

  updateGiftBox(id: string, giftBox: GiftBox): Observable<{ success: boolean; data: GiftBox }> {
    return this.api.put(`/gift-boxes/${id}`, giftBox);
  }

  deleteGiftBox(id: string): Observable<{ success: boolean }> {
    return this.api.delete(`/gift-boxes/${id}`);
  }
}
