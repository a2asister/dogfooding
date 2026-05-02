import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Store {
  id?: string;
  name: string;
  address: string;
  phone: string;
  manager?: string;
  createDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  constructor(private api: ApiService) { }

  getStores(): Observable<{ success: boolean; data: Store[] }> {
    return this.api.get('/stores');
  }

  createStore(store: Store): Observable<{ success: boolean; data: Store }> {
    return this.api.post('/stores', store);
  }

  updateStore(id: string, store: Store): Observable<{ success: boolean; data: Store }> {
    return this.api.put(`/stores/${id}`, store);
  }

  deleteStore(id: string): Observable<{ success: boolean }> {
    return this.api.delete(`/stores/${id}`);
  }
}
