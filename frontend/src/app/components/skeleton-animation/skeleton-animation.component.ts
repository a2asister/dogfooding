import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

interface Point {
  x: number;
  y: number;
}

interface Bone {
  from: Point;
  to: Point;
}

@Component({
  selector: 'app-skeleton-animation',
  templateUrl: './skeleton-animation.component.html',
  styleUrls: ['./skeleton-animation.component.css']
})
export class SkeletonAnimationComponent implements OnChanges {
  @Input() frame: number = 0;
  bones: Bone[] = [];
  joints: Point[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['frame']) {
      this.calculateSkeleton();
    }
  }

  private calculateSkeleton(): void {
    const t = this.frame / 30;
    const angle = Math.sin(t * Math.PI * 2) * 0.5;
    const squatDepth = Math.abs(Math.sin(t * Math.PI * 2)) * 60;

    const centerX = 200;
    const centerY = 150;

    const head: Point = { x: centerX, y: centerY - 100 + squatDepth * 0.3 };
    const neck: Point = { x: centerX, y: centerY - 70 + squatDepth * 0.3 };
    const shoulderLeft: Point = { x: centerX - 50, y: centerY - 60 + squatDepth * 0.3 };
    const shoulderRight: Point = { x: centerX + 50, y: centerY - 60 + squatDepth * 0.3 };
    const elbowLeft: Point = { x: centerX - 70 + Math.sin(angle) * 20, y: centerY - 30 + squatDepth * 0.3 };
    const elbowRight: Point = { x: centerX + 70 - Math.sin(angle) * 20, y: centerY - 30 + squatDepth * 0.3 };
    const handLeft: Point = { x: centerX - 80 + Math.sin(angle) * 30, y: centerY + squatDepth * 0.3 };
    const handRight: Point = { x: centerX + 80 - Math.sin(angle) * 30, y: centerY + squatDepth * 0.3 };
    const hip: Point = { x: centerX, y: centerY + squatDepth * 0.5 };
    const kneeLeft: Point = { x: centerX - 35, y: centerY + 60 + squatDepth };
    const kneeRight: Point = { x: centerX + 35, y: centerY + 60 + squatDepth };
    const footLeft: Point = { x: centerX - 40, y: centerY + 130 + squatDepth * 0.8 };
    const footRight: Point = { x: centerX + 40, y: centerY + 130 + squatDepth * 0.8 };

    this.bones = [
      { from: head, to: neck },
      { from: neck, to: shoulderLeft },
      { from: neck, to: shoulderRight },
      { from: shoulderLeft, to: elbowLeft },
      { from: shoulderRight, to: elbowRight },
      { from: elbowLeft, to: handLeft },
      { from: elbowRight, to: handRight },
      { from: neck, to: hip },
      { from: hip, to: kneeLeft },
      { from: hip, to: kneeRight },
      { from: kneeLeft, to: footLeft },
      { from: kneeRight, to: footRight }
    ];

    this.joints = [head, neck, shoulderLeft, shoulderRight, elbowLeft, elbowRight, handLeft, handRight, hip, kneeLeft, kneeRight, footLeft, footRight];
  }
}
