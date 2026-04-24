import Phaser from 'phaser';

export class Obstacle extends Phaser.GameObjects.Container {
  private graphics: Phaser.GameObjects.Graphics;
  public obstacleType: 'spike' | 'barrier';
  public isActive: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number, type: 'spike' | 'barrier') {
    super(scene, x, y);
    this.obstacleType = type;
    
    if (type === 'spike') {
      this.setSize(40, 30);
    } else {
      this.setSize(50, 60);
    }
    
    this.graphics = scene.make.graphics();
    this.add(this.graphics);
    
    this.drawObstacle();
    
    scene.add.existing(this);
  }

  private drawObstacle(): void {
    this.graphics.clear();
    
    if (this.obstacleType === 'spike') {
      this.graphics.fillStyle(0x666666);
      this.graphics.lineStyle(2, 0x444444);
      
      const points = [
        { x: 0, y: -30 },
        { x: -20, y: 0 },
        { x: 20, y: 0 }
      ];
      
      this.graphics.beginPath();
      this.graphics.moveTo(points[0].x, points[0].y);
      this.graphics.lineTo(points[1].x, points[1].y);
      this.graphics.lineTo(points[2].x, points[2].y);
      this.graphics.closePath();
      this.graphics.fillPath();
      this.graphics.strokePath();
      
      this.graphics.lineStyle(1, 0x888888);
      this.graphics.lineBetween(0, -25, -10, -10);
      
    } else {
      this.graphics.fillStyle(0x555555);
      this.graphics.lineStyle(3, 0x333333);
      
      this.graphics.fillRect(-25, -60, 50, 60);
      this.graphics.strokeRect(-25, -60, 50, 60);
      
      this.graphics.fillStyle(0xffff00);
      for (let i = 0; i < 3; i++) {
        const yPos = -50 + i * 20;
        this.graphics.fillRect(-25, yPos, 50, 5);
      }
      
      this.graphics.fillStyle(0x000000);
      for (let i = 0; i < 3; i++) {
        const yPos = -45 + i * 20;
        this.graphics.fillRect(-25, yPos, 50, 5);
      }
    }
  }
}
