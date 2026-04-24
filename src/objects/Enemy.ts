import Phaser from 'phaser';

export class Enemy extends Phaser.GameObjects.Container {
  private graphics: Phaser.GameObjects.Graphics;
  public health: number;
  public maxHealth: number;
  public isDead: boolean = false;
  private enemyType: 'normal' | 'fast' | 'tank';
  private animationFrame: number = 0;
  private animationTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: 'normal' | 'fast' | 'tank' = 'normal') {
    super(scene, x, y);
    this.enemyType = type;
    
    switch (type) {
      case 'fast':
        this.maxHealth = 50;
        this.setSize(30, 65);
        break;
      case 'tank':
        this.maxHealth = 100;
        this.setSize(45, 85);
        break;
      default:
        this.maxHealth = 75;
        this.setSize(35, 70);
        break;
    }
    
    this.health = this.maxHealth;
    
    this.graphics = scene.make.graphics();
    this.add(this.graphics);
    
    this.drawEnemy();
    
    scene.add.existing(this);
  }

  preUpdate(_time: number, delta: number): void {
    this.animationTimer += delta;
    if (this.animationTimer >= 150) {
      this.animationFrame = (this.animationFrame + 1) % 4;
      this.animationTimer = 0;
      this.drawEnemy();
    }
  }

  private drawEnemy(): void {
    this.graphics.clear();
    
    let bodyColor: number;
    
    switch (this.enemyType) {
      case 'fast':
        bodyColor = 0xff6b6b;
        break;
      case 'tank':
        bodyColor = 0x8b0000;
        break;
      default:
        bodyColor = 0xff4444;
        break;
    }
    
    this.graphics.lineStyle(4, bodyColor);
    this.graphics.fillStyle(bodyColor);
    
    const centerX = 0;
    const scale = this.enemyType === 'tank' ? 1.2 : (this.enemyType === 'fast' ? 0.9 : 1);
    const headY = -30 * scale;
    const headRadius = 10 * scale;
    
    this.graphics.strokeCircle(centerX, headY, headRadius);
    
    this.graphics.fillStyle(0x000000);
    this.graphics.fillCircle(-3, headY - 2, 2);
    this.graphics.fillCircle(3, headY - 2, 2);
    
    this.graphics.lineStyle(2, 0x000000);
    this.graphics.lineBetween(-6, headY - 6, -1, headY - 4);
    this.graphics.lineBetween(6, headY - 6, 1, headY - 4);
    
    this.graphics.lineStyle(4 * scale, bodyColor);
    const bodyStartY = headY + headRadius;
    const bodyEndY = bodyStartY + 20 * scale;
    this.graphics.lineBetween(centerX, bodyStartY, centerX, bodyEndY);
    
    const armY = bodyStartY + 8 * scale;
    const legStartY = bodyEndY;
    
    switch (this.animationFrame) {
      case 0:
        this.graphics.lineBetween(centerX, armY, centerX - 15 * scale, armY + 10 * scale);
        this.graphics.lineBetween(centerX, armY, centerX + 15 * scale, armY - 5 * scale);
        this.graphics.lineBetween(centerX, legStartY, centerX - 12 * scale, legStartY + 20 * scale);
        this.graphics.lineBetween(centerX, legStartY, centerX + 8 * scale, legStartY + 18 * scale);
        break;
        
      case 1:
        this.graphics.lineBetween(centerX, armY, centerX - 12 * scale, armY);
        this.graphics.lineBetween(centerX, armY, centerX + 12 * scale, armY);
        this.graphics.lineBetween(centerX, legStartY, centerX - 5 * scale, legStartY + 20 * scale);
        this.graphics.lineBetween(centerX, legStartY, centerX + 5 * scale, legStartY + 20 * scale);
        break;
        
      case 2:
        this.graphics.lineBetween(centerX, armY, centerX - 15 * scale, armY - 5 * scale);
        this.graphics.lineBetween(centerX, armY, centerX + 15 * scale, armY + 10 * scale);
        this.graphics.lineBetween(centerX, legStartY, centerX - 8 * scale, legStartY + 18 * scale);
        this.graphics.lineBetween(centerX, legStartY, centerX + 12 * scale, legStartY + 20 * scale);
        break;
        
      case 3:
        this.graphics.lineBetween(centerX, armY, centerX - 10 * scale, armY - 3 * scale);
        this.graphics.lineBetween(centerX, armY, centerX + 10 * scale, armY + 3 * scale);
        this.graphics.lineBetween(centerX, legStartY, centerX - 6 * scale, legStartY + 19 * scale);
        this.graphics.lineBetween(centerX, legStartY, centerX + 6 * scale, legStartY + 19 * scale);
        break;
    }
    
    if (this.health < this.maxHealth) {
      const barWidth = 30 * scale;
      const barHeight = 4;
      const barY = headY - headRadius - 10;
      
      this.graphics.fillStyle(0x333333);
      this.graphics.fillRect(-barWidth / 2, barY, barWidth, barHeight);
      
      const healthPercent = this.health / this.maxHealth;
      const healthColor = healthPercent > 0.5 ? 0x2ecc71 : (healthPercent > 0.25 ? 0xf39c12 : 0xe74c3c);
      
      this.graphics.fillStyle(healthColor);
      this.graphics.fillRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight);
    }
  }

  public takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.isDead = true;
    }
    this.drawEnemy();
  }
}
