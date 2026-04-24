import Phaser from 'phaser';
import { GameData } from '../managers/GameData';
import { GAME_CONFIG } from '../config/gameConfig';

export class Player extends Phaser.GameObjects.Container {
  private gameData: GameData;
  private graphics: Phaser.GameObjects.Graphics;
  private isJumping: boolean = false;
  private isAttacking: boolean = false;
  private isRunning: boolean = false;
  private isInvincible: boolean = false;
  private facingLeft: boolean = false;
  private animationFrame: number = 0;
  private animationTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.gameData = GameData.getInstance();
    
    this.graphics = scene.make.graphics();
    this.add(this.graphics);
    
    this.setSize(GAME_CONFIG.player.width, GAME_CONFIG.player.height);
    this.drawStickman();
    
    scene.add.existing(this);
  }

  preUpdate(_time: number, delta: number): void {
    if (this.isRunning && !this.isJumping) {
      this.animationTimer += delta;
      if (this.animationTimer >= 100) {
        this.animationFrame = (this.animationFrame + 1) % 4;
        this.animationTimer = 0;
        this.drawStickman();
      }
    } else if (this.isJumping) {
      this.drawStickman();
    } else if (this.isAttacking) {
      this.drawStickman();
    }
  }

  private drawStickman(): void {
    this.graphics.clear();
    
    const skin = this.gameData.playerState.skin;
    const color = Phaser.Display.Color.HexStringToColor(skin.color).color;
    
    this.graphics.lineStyle(4, color);
    this.graphics.fillStyle(color);
    
    const centerX = 0;
    const headY = -35;
    
    this.graphics.strokeCircle(centerX, headY, 12);
    
    if (this.facingLeft) {
      this.graphics.fillCircle(-4, headY - 2, 2);
    } else {
      this.graphics.fillCircle(4, headY - 2, 2);
    }
    
    const bodyStartY = headY + 12;
    const bodyEndY = bodyStartY + 25;
    this.graphics.lineBetween(centerX, bodyStartY, centerX, bodyEndY);
    
    if (this.isJumping) {
      this.drawJumpingPose(centerX, bodyEndY);
    } else if (this.isAttacking) {
      this.drawAttackingPose(centerX, bodyStartY, bodyEndY);
    } else if (this.isRunning) {
      this.drawRunningPose(centerX, bodyStartY, bodyEndY);
    } else {
      this.drawIdlePose(centerX, bodyStartY, bodyEndY);
    }
    
    if (this.isInvincible) {
      this.graphics.lineStyle(3, 0x00ffff, 0.5);
      this.graphics.strokeRect(-20, -40, 40, 80);
    }
    
    if (this.gameData.shieldActive) {
      this.graphics.lineStyle(4, 0x3498db, 0.7);
      this.graphics.strokeCircle(centerX, 0, 35);
    }
  }

  private drawIdlePose(centerX: number, bodyStartY: number, bodyEndY: number): void {
    const armY = bodyStartY + 10;
    this.graphics.lineBetween(centerX, armY, centerX - 15, armY + 15);
    this.graphics.lineBetween(centerX, armY, centerX + 15, armY + 15);
    
    const legStartY = bodyEndY;
    this.graphics.lineBetween(centerX, legStartY, centerX - 10, legStartY + 25);
    this.graphics.lineBetween(centerX, legStartY, centerX + 10, legStartY + 25);
  }

  private drawRunningPose(centerX: number, bodyStartY: number, bodyEndY: number): void {
    const armY = bodyStartY + 10;
    const legStartY = bodyEndY;
    
    switch (this.animationFrame) {
      case 0:
        this.graphics.lineBetween(centerX, armY, centerX - 20, armY - 10);
        this.graphics.lineBetween(centerX, armY, centerX + 20, armY + 10);
        
        this.graphics.lineBetween(centerX, legStartY, centerX - 15, legStartY + 25);
        this.graphics.lineBetween(centerX, legStartY, centerX + 10, legStartY + 20);
        break;
        
      case 1:
        this.graphics.lineBetween(centerX, armY, centerX - 15, armY);
        this.graphics.lineBetween(centerX, armY, centerX + 15, armY);
        
        this.graphics.lineBetween(centerX, legStartY, centerX - 5, legStartY + 25);
        this.graphics.lineBetween(centerX, legStartY, centerX + 5, legStartY + 25);
        break;
        
      case 2:
        this.graphics.lineBetween(centerX, armY, centerX - 20, armY + 10);
        this.graphics.lineBetween(centerX, armY, centerX + 20, armY - 10);
        
        this.graphics.lineBetween(centerX, legStartY, centerX - 10, legStartY + 20);
        this.graphics.lineBetween(centerX, legStartY, centerX + 15, legStartY + 25);
        break;
        
      case 3:
        this.graphics.lineBetween(centerX, armY, centerX - 15, armY - 5);
        this.graphics.lineBetween(centerX, armY, centerX + 15, armY + 5);
        
        this.graphics.lineBetween(centerX, legStartY, centerX - 8, legStartY + 22);
        this.graphics.lineBetween(centerX, legStartY, centerX + 8, legStartY + 22);
        break;
    }
  }

  private drawJumpingPose(centerX: number, bodyEndY: number): void {
    const bodyStartY = -35 + 12;
    const armY = bodyStartY + 10;
    const legStartY = bodyEndY;
    
    this.graphics.lineBetween(centerX, armY, centerX - 20, armY - 20);
    this.graphics.lineBetween(centerX, armY, centerX + 20, armY - 20);
    
    this.graphics.lineBetween(centerX, legStartY, centerX - 15, legStartY + 10);
    this.graphics.lineBetween(centerX, legStartY, centerX + 15, legStartY + 10);
  }

  private drawAttackingPose(centerX: number, bodyStartY: number, bodyEndY: number): void {
    const armY = bodyStartY + 10;
    const legStartY = bodyEndY;
    
    if (this.facingLeft) {
      this.graphics.lineBetween(centerX, armY, centerX - 40, armY);
      this.graphics.lineBetween(centerX, armY, centerX + 15, armY + 10);
    } else {
      this.graphics.lineBetween(centerX, armY, centerX - 15, armY + 10);
      this.graphics.lineBetween(centerX, armY, centerX + 40, armY);
    }
    
    this.graphics.lineBetween(centerX, legStartY, centerX - 15, legStartY + 25);
    this.graphics.lineBetween(centerX, legStartY, centerX + 15, legStartY + 25);
  }

  public setJumping(value: boolean): void {
    this.isJumping = value;
    this.drawStickman();
  }

  public setAttacking(value: boolean): void {
    this.isAttacking = value;
    this.drawStickman();
  }

  public setRunning(value: boolean): void {
    this.isRunning = value;
    if (!value) {
      this.animationFrame = 0;
      this.drawStickman();
    }
  }

  public setInvincible(value: boolean): void {
    this.isInvincible = value;
    this.drawStickman();
  }

  public setFacingLeft(value: boolean): void {
    this.facingLeft = value;
    this.drawStickman();
  }
}
