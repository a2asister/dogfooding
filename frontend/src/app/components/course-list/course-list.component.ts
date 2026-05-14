import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Course } from '../../services/api.service';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css']
})
export class CourseListComponent {
  @Input() courses: Course[] = [];
  @Input() favorites: number[] = [];
  @Output() selectCourse = new EventEmitter<Course>();
  @Output() toggleFavorite = new EventEmitter<number>();

  onSelectCourse(course: Course): void {
    this.selectCourse.emit(course);
  }

  onToggleFavorite(courseId: number): void {
    this.toggleFavorite.emit(courseId);
  }

  isFavorite(courseId: number): boolean {
    return this.favorites.includes(courseId);
  }
}
