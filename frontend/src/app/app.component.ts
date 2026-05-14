import { Component, OnInit } from '@angular/core';
import { ApiService, Course, CheckinRecord, UserStats, Favorite } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = '健身动作动态跟练系统';
  currentFrame = 0;
  isPlaying = false;
  progress = 0;
  showCheckin = false;
  courses: Course[] = [];
  favorites: number[] = [];
  checkinRecords: CheckinRecord[] = [];
  userStats: UserStats = { totalWorkouts: 0, totalDuration: 0, totalCalories: 0, streak: 0 };
  selectedCourse: Course | null = null;
  activeTab = 'workout';

  private animationFrame: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadFavorites();
    this.loadCheckinRecords();
    this.loadUserStats();
  }

  loadCourses(): void {
    this.apiService.getCourses().subscribe({
      next: (data) => this.courses = data,
      error: () => this.loadMockCourses()
    });
  }

  loadMockCourses(): void {
    this.courses = [
      { id: 1, name: '深蹲入门', description: '基础深蹲动作训练', duration: 15, calories: 100, difficulty: '简单', thumbnail: '🏋️' },
      { id: 2, name: '俯卧撑训练', description: '上肢力量核心训练', duration: 20, calories: 150, difficulty: '中等', thumbnail: '💪' },
      { id: 3, name: '平板支撑', description: '核心肌群稳定性训练', duration: 10, calories: 80, difficulty: '简单', thumbnail: '🧘' },
      { id: 4, name: '跳跃训练', description: '爆发力有氧训练', duration: 25, calories: 200, difficulty: '困难', thumbnail: '🦘' }
    ];
  }

  loadFavorites(): void {
    this.apiService.getFavorites().subscribe({
      next: (data: Favorite[]) => this.favorites = data.map((f) => f.courseId),
      error: () => this.favorites = [1, 3]
    });
  }

  loadCheckinRecords(): void {
    this.apiService.getCheckinRecords().subscribe({
      next: (data) => this.checkinRecords = data,
      error: () => this.checkinRecords = []
    });
  }

  loadUserStats(): void {
    this.apiService.getUserStats().subscribe({
      next: (data) => this.userStats = data,
      error: () => this.userStats = { totalWorkouts: 5, totalDuration: 90, totalCalories: 650, streak: 3 }
    });
  }

  togglePlay(): void {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.startAnimation();
    } else if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private startAnimation(): void {
    let lastTime = 0;
    const animate = (time: number) => {
      if (time - lastTime > 100) {
        this.currentFrame = (this.currentFrame + 1) % 30;
        this.progress = Math.min(100, this.progress + 0.5);
        if (this.progress >= 100) {
          this.completeWorkout();
          return;
        }
        lastTime = time;
      }
      if (this.isPlaying) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };
    this.animationFrame = requestAnimationFrame(animate);
  }

  private completeWorkout(): void {
    this.isPlaying = false;
    this.showCheckin = true;
    const dateStr = new Date().toISOString().split('T')[0];
    const checkin: CheckinRecord = {
      id: Date.now(),
      courseId: this.selectedCourse?.id || 1,
      courseName: this.selectedCourse?.name || '深蹲入门',
      date: dateStr!,
      duration: this.selectedCourse?.duration || 15
    };
    this.apiService.checkin(checkin).subscribe({
      next: () => {
        this.loadCheckinRecords();
        this.loadUserStats();
      }
    });
    setTimeout(() => {
      this.showCheckin = false;
      this.progress = 0;
    }, 3000);
  }

  selectCourse(course: Course): void {
    this.selectedCourse = course;
    this.currentFrame = 0;
    this.progress = 0;
    this.isPlaying = false;
  }

  toggleFavorite(courseId: number): void {
    const index = this.favorites.indexOf(courseId);
    if (index > -1) {
      this.favorites.splice(index, 1);
      this.apiService.removeFavorite(courseId).subscribe();
    } else {
      this.favorites.push(courseId);
      this.apiService.addFavorite(courseId).subscribe();
    }
  }

  resetProgress(): void {
    this.progress = 0;
    this.currentFrame = 0;
    this.isPlaying = false;
  }
}
