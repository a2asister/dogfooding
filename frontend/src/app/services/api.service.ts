import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Course {
  id: number;
  name: string;
  description: string;
  duration: number;
  calories: number;
  difficulty: string;
  thumbnail: string;
}

interface CheckinRecord {
  id: number;
  courseId: number;
  courseName: string;
  date: string;
  duration: number;
}

interface UserStats {
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  streak: number;
}

export interface Favorite {
  id: number;
  courseId: number;
}

export interface Course {
  id: number;
  name: string;
  description: string;
  duration: number;
  calories: number;
  difficulty: string;
  thumbnail: string;
}

export interface CheckinRecord {
  id: number;
  courseId: number;
  courseName: string;
  date: string;
  duration: number;
}

export interface UserStats {
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  streak: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3080/api';

  constructor(private http: HttpClient) { }

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses`);
  }

  getFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.apiUrl}/favorites`);
  }

  addFavorite(courseId: number): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.apiUrl}/favorites`, { courseId });
  }

  removeFavorite(courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/favorites/${courseId}`);
  }

  getCheckinRecords(): Observable<CheckinRecord[]> {
    return this.http.get<CheckinRecord[]>(`${this.apiUrl}/checkins`);
  }

  checkin(checkinData: CheckinRecord): Observable<CheckinRecord> {
    return this.http.post<CheckinRecord>(`${this.apiUrl}/checkins`, checkinData);
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats`);
  }
}
