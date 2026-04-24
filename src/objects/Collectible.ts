import Phaser from 'phaser';

export class Collectible extends Phaser.GameObjects.Container {
  private graphics: Phaser.GameObjects.Graphics;
  public collectibleType: 'coin' | 'energy' | 'health';
  public value: number;
  public isCollected: boolean = false;
  private floatOffset: number = 0;
  private initialY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: 'coin' | 'energy' | 'health') {
    super(scene, x, y);
    this.collectibleType = type;
    this.initialY = y;
    
    switch (type) {
      case 'coin':
        this.setSize(20, 20);
        this.value = 1;
        break;
      case 'energy':
        this.setSize(24, 24);
        this.value = 0;
        break;
      case 'health':
        this.setSize(30, 30);
        this.value = 30;
        break;
    }
    
    this.graphics = scene.make.graphics();
    this.add(this.graphics);
    
    this.drawCollectible();
    
    scene.add.existing(this);
  }

  preUpdate(_time: number, delta: number): void {
    this.floatOffset += delta * 0.005;
    this.y = this.initialY + Math.sin(this.floatOffset) * 5;
    this.drawCollectible();
  }

  private drawCollectible(): void {
    this.graphics.clear();
    
    const centerX = 0;
    const centerY = 0;
    
    switch (this.collectibleType) {
      case 'coin':
        this.drawCoin(centerX, centerY);
        break;
      case 'energy':
        this.drawEnergy(centerX, centerY);
        break;
      case 'health':
        this.drawHealth(centerX, centerY);
        break;
    }
  }

  private drawCoin(x: number, y: number): void {
    const radius = 10;
    
    this.graphics.fillStyle(0xffd700);
    this.graphics.fillCircle(x, y, radius);
    
    this.graphics.lineStyle(2, 0xf39c12);
    this.graphics.strokeCircle(x, y, radius);
    
    this.graphics.lineStyle(2, 0xf1c40f);
    this.graphics.strokeCircle(x, y, radius - 3);
    
    this.graphics.fillStyle(0xffffff, 0.5);
    this.graphics.fillCircle(x - 3, y - 3, 2);
  }

  private drawEnergy(x: number, y: number): void {
    this.graphics.fillStyle(0x00ffff);
    
    const points: { x: number; y: number }[] = [];
    const outerRadius = 12;
    const innerRadius = 5;
    
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      points.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius
      });
    }
    
    this.graphics.beginPath();
    this.graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.graphics.lineTo(points[i].x, points[i].y);
    }
    this.graphics.closePath();
    this.graphics.fillPath();
    
    this.graphics.lineStyle(2, 0x00aaaa, 0.5);
    this.graphics.strokePath();
    
    this.graphics.fillStyle(0xffffff, 0.7);
    this.graphics.fillCircle(x, y, 3);
  }

  private drawHealth(x: number, y: number): void {
    this.graphics.fillStyle(0xff0000);
    
    const points: { x: number; y: number }[] = [
      { x: x, y: y + 10 },
      { x: x - 8, y: y + 2 },
      { x: x - 12, y: y - 5 },
      { x: x - 10, y: y - 12 },
      { x: x - 4, y: y - 14 },
      { x: x, y: y - 10 },
      { x: x + 4, y: y - 14 },
      { x: x + 10, y: y - 12 },
      { x: x + 12, y: y - 5 },
      { x: x + 8, y: y + 2 }
    ];
    
    this.graphics.beginPath();
    this.graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.graphics.lineTo(points[i].x, points[i].y);
    }
    this.graphics.closePath();
    this.graphics.fillPath();
    
    this.graphics.lineStyle(2, 0xcc0000);
    this.graphics.strokePath();
    
    this.graphics.fillStyle(0xff6666, 0.7);
    this.graphics.fillCircle(x - 6, y - 8, 3);
  }

  public collect(): void {
    this.isCollected = true;
  }
}
