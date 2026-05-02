import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface TastingEvent {
  id?: string;
  title: string;
  description: string;
  date: string;
  location: string;
  maxParticipants: number;
  participants?: string[];
  status?: string;
  image?: string;
  createDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TastingEventService {
  constructor(private api: ApiService) { }

  getEvents(): Observable<{ success: boolean; data: TastingEvent[] }> {
    return this.api.get('/tasting-events');
  }

  createEvent(event: TastingEvent): Observable<{ success: boolean; data: TastingEvent }> {
    return this.api.post('/tasting-events', event);
  }

  updateEvent(id: string, event: TastingEvent): Observable<{ success: boolean; data: TastingEvent }> {
    return this.api.put(`/tasting-events/${id}`, event);
  }

  deleteEvent(id: string): Observable<{ success: boolean }> {
    return this.api.delete(`/tasting-events/${id}`);
  }

  joinEvent(eventId: string, memberId: string): Observable<{ success: boolean; data: TastingEvent }> {
    return this.api.post(`/tasting-events/${eventId}/join`, { memberId });
  }
}
