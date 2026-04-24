import Phaser from 'phaser';
import { GameData } from '../managers/GameData';

export class PreloadScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private percentText!: Phaser.GameObjects.Text;
  private assetText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(240, 270, 320, 50);

    this.progressBar = this.add.graphics();

    this.loadingText = this.add.text(400, 200, '加载中...', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.percentText = this.add.text(400, 295, '0%', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.assetText = this.add.text(400, 350, '', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0xffffff, 1);
      this.progressBar.fillRect(250, 280, 300 * value, 30);
      this.percentText.setText(Math.round(value * 100) + '%');
    });

    this.load.on('fileprogress', (file: any) => {
      this.assetText.setText('加载资源: ' + file.key);
    });

    this.load.on('complete', () => {
      this.progressBar.destroy();
      this.progressBox.destroy();
      this.loadingText.destroy();
      this.percentText.destroy();
      this.assetText.destroy();
    });

    this.loadGraphics();
  }

  private loadGraphics(): void {
    const graphics = this.add.graphics();
    
    graphics.fillStyle(0xffffff);
    graphics.fillRect(0, 0, 40, 80);
    graphics.generateTexture('stickman', 40, 80);
    graphics.clear();
    
    graphics.fillStyle(0xffd700);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('coin', 20, 20);
    graphics.clear();
    
    this.drawStar(graphics, 12, 12, 5, 10, 5, 0x00ffff);
    graphics.generateTexture('energy', 24, 24);
    graphics.clear();
    
    graphics.fillStyle(0xff0000);
    graphics.fillTriangle(15, 5, 25, 25, 5, 25);
    graphics.generateTexture('health', 30, 30);
    graphics.clear();
    
    graphics.fillStyle(0xff4444);
    graphics.fillRect(0, 0, 35, 70);
    graphics.generateTexture('enemy', 35, 70);
    graphics.clear();
    
    graphics.fillStyle(0x666666);
    graphics.fillTriangle(20, 0, 40, 30, 0, 30);
    graphics.generateTexture('spike', 40, 30);
    graphics.clear();
    
    graphics.fillStyle(0x888888);
    graphics.fillRect(0, 0, 50, 60);
    graphics.generateTexture('barrier', 50, 60);
    graphics.clear();
    
    graphics.destroy();
  }

  private drawStar(
    graphics: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    points: number,
    outerRadius: number,
    innerRadius: number,
    color: number
  ): void {
    graphics.fillStyle(color);
    graphics.lineStyle(2, 0x00aaaa);
    
    const coords: { x: number; y: number }[] = [];
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / points) * i - Math.PI / 2;
      coords.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius
      });
    }
    
    graphics.beginPath();
    graphics.moveTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
      graphics.lineTo(coords[i].x, coords[i].y);
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
  }

  create(): void {
    const gameData = GameData.getInstance();
    
    if (!gameData.gameState.tutorialCompleted) {
      this.scene.start('TutorialScene');
    } else {
      this.scene.start('MenuScene');
    }
  }
}
