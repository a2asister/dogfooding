import { Component, Input, ElementRef, HostListener } from '@angular/core';
import { Skill } from '../models/skill.model';

@Component({
  selector: 'app-skill-card',
  templateUrl: './skill-card.component.html',
  styleUrls: ['./skill-card.component.scss'],
})
export class SkillCardComponent {
  @Input() skill!: Skill;
  @Input() isFlipped = false;

  isDragging = false;
  startX = 0;
  startY = 0;
  currentX = 0;
  currentY = 0;
  velocityX = 0;
  velocityY = 0;
  lastTime = 0;
  rotationX = 0;
  rotationY = 0;

  private animationFrameId: number | null = null;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.startX = event.clientX - this.currentX;
    this.startY = event.clientY - this.currentY;
    this.lastTime = performance.now();
    this.velocityX = 0;
    this.velocityY = 0;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    const newX = event.clientX - this.startX;
    const newY = event.clientY - this.startY;

    if (deltaTime > 0) {
      this.velocityX = (newX - this.currentX) / deltaTime * 16;
      this.velocityY = (newY - this.currentY) / deltaTime * 16;
    }

    this.currentX = newX;
    this.currentY = newY;
    this.lastTime = currentTime;

    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;
    this.rotationY = (mouseX / rect.width) * 30;
    this.rotationX = -(mouseY / rect.height) * 30;
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
    this.applyPhysics();
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.applyMagneticEffect();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.resetRotation();
  }

  private applyPhysics() {
    const friction = 0.95;
    const bounceThreshold = 2;

    const animate = () => {
      this.velocityX *= friction;
      this.velocityY *= friction;
      this.currentX += this.velocityX;
      this.currentY += this.velocityY;

      if (Math.abs(this.velocityX) > bounceThreshold || Math.abs(this.velocityY) > bounceThreshold) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.snapToGrid();
      }
    };

    animate();
  }

  private snapToGrid() {
    const gridSize = 20;
    this.currentX = Math.round(this.currentX / gridSize) * gridSize;
    this.currentY = Math.round(this.currentY / gridSize) * gridSize;
  }

  private applyMagneticEffect() {
    const magnetStrength = 0.3;
    this.animationFrameId = requestAnimationFrame(() => {
      this.rotationY *= magnetStrength;
      this.rotationX *= magnetStrength;
    });
  }

  private resetRotation() {
    const animate = () => {
      this.rotationY *= 0.9;
      this.rotationX *= 0.9;
      if (Math.abs(this.rotationY) > 0.1 || Math.abs(this.rotationX) > 0.1) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.rotationY = 0;
        this.rotationX = 0;
      }
    };
    animate();
  }

  toggleFlip() {
    this.isFlipped = !this.isFlipped;
  }

  getCardTransform(): string {
    const flipRotation = this.isFlipped ? 180 : 0;
    return `translate(${this.currentX}px, ${this.currentY}px) rotateX(${this.rotationX}deg) rotateY(${this.rotationY + flipRotation}deg)`;
  }

  getCardBackground(): string {
    return `linear-gradient(135deg, ${this.skill.primaryColor}, ${this.skill.secondaryColor})`;
  }

  getCardTransition(): string {
    return this.isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  }
}