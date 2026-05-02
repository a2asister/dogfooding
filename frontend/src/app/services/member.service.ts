import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Member {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  totalPoints?: number;
  currentPoints?: number;
  level?: string;
  joinDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  constructor(private api: ApiService) { }

  getMembers(): Observable<{ success: boolean; data: Member[] }> {
    return this.api.get('/members');
  }

  createMember(member: Member): Observable<{ success: boolean; data: Member }> {
    return this.api.post('/members', member);
  }

  updateMember(id: string, member: Member): Observable<{ success: boolean; data: Member }> {
    return this.api.put(`/members/${id}`, member);
  }

  deleteMember(id: string): Observable<{ success: boolean }> {
    return this.api.delete(`/members/${id}`);
  }
}
