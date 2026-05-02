import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface InventoryItem {
  id?: string;
  productName: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  minStock: number;
  updateDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  constructor(private api: ApiService) { }

  getInventory(): Observable<{ success: boolean; data: InventoryItem[] }> {
    return this.api.get('/inventory');
  }

  createItem(item: InventoryItem): Observable<{ success: boolean; data: InventoryItem }> {
    return this.api.post('/inventory', item);
  }

  updateItem(id: string, item: InventoryItem): Observable<{ success: boolean; data: InventoryItem }> {
    return this.api.put(`/inventory/${id}`, item);
  }

  deleteItem(id: string): Observable<{ success: boolean }> {
    return this.api.delete(`/inventory/${id}`);
  }
}
