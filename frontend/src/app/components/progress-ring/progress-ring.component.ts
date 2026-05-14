import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-progress-ring',
  templateUrl: './progress-ring.component.html',
  styleUrls: ['./progress-ring.component.css']
})
export class ProgressRingComponent implements OnChanges {
  @Input() progress: number = 0;
  circumference: number = 2 * Math.PI * 45;
  strokeDashoffset: number = 0;
  displayProgress: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['progress']) {
      this.strokeDashoffset = this.circumference - (this.progress / 100) * this.circumference;
      this.displayProgress = Math.round(this.progress);
    }
  }
}
