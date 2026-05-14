import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { SkeletonAnimationComponent } from './components/skeleton-animation/skeleton-animation.component';
import { ProgressRingComponent } from './components/progress-ring/progress-ring.component';
import { CheckinIconComponent } from './components/checkin-icon/checkin-icon.component';
import { MotionTrailComponent } from './components/motion-trail/motion-trail.component';
import { CourseListComponent } from './components/course-list/course-list.component';
import { UserStatsComponent } from './components/user-stats/user-stats.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { ApiService } from './services/api.service';

@NgModule({
  declarations: [
    AppComponent,
    SkeletonAnimationComponent,
    ProgressRingComponent,
    CheckinIconComponent,
    MotionTrailComponent,
    CourseListComponent,
    UserStatsComponent,
    FavoritesComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
