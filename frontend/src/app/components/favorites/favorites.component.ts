import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Course } from '../../services/api.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent {
  @Input() courses: Course[] = [];
  @Input() favorites: number[] = [];
  @Output() selectCourse = new EventEmitter<Course>();
  @Output() toggleFavorite = new EventEmitter<number>();

  getFavoriteCourses(): Course[] {
    return this.courses.filter(course => this.favorites.includes(course.id));
  }

  onSelectCourse(course: Course): void {
    this.selectCourse.emit(course);
  }

  onToggleFavorite(courseId: number): void {
    this.toggleFavorite.emit(courseId);
  }
}
