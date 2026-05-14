import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
}

@Component({
  selector: 'app-motion-trail',
  templateUrl: './motion-trail.component.html',
  styleUrls: ['./motion-trail.component.css']
})
export class MotionTrailComponent implements OnChanges {
  @Input() frame: number = 0;
  trailPoints: TrailPoint[] = [];
  private maxTrailLength: number = 10;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['frame']) {
      this.updateTrail();
    }
  }

  private updateTrail(): void {
    const t = this.frame / 30;
    const centerX = 200;
    const centerY = 150;
    const squatDepth = Math.abs(Math.sin(t * Math.PI * 2)) * 60;

    const handLeftX = centerX - 80 + Math.sin(Math.sin(t * Math.PI * 2) * 0.5) * 30;
    const handLeftY = centerY + squatDepth * 0.3;

    const newPoint: TrailPoint = {
      x: handLeftX,
      y: handLeftY,
      opacity: 1
    };

    this.trailPoints.unshift(newPoint);
    
    if (this.trailPoints.length > this.maxTrailLength) {
      this.trailPoints.pop();
    }

    this.trailPoints.forEach((point, index) => {
      point.opacity = 1 - (index / this.maxTrailLength);
    });
  }

  getPolylinePoints(): string {
    return this.trailPoints.map(p => `${p.x},${p.y}`).join(' ');
  }
}
