import Phaser from 'phaser';
import { GameData } from '../managers/GameData';

export class MenuScene extends Phaser.Scene {
  private gameData: GameData;

  constructor() {
    super({ key: 'MenuScene' });
    this.gameData = GameData.getInstance();
  }

  create(): void {
    // 设置背景颜色
    this.cameras.main.setBackgroundColor(0x1a1a2e);

    // 添加游戏标题
    const title = this.add.text(400, 150, '火柴人跑酷大战', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加副标题
    this.add.text(400, 200, 'Stickman Parkour Battle', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 显示最高记录
    this.add.text(400, 280, `最远距离: ${Math.floor(this.gameData.gameState.maxDistance)}m`, {
      fontSize: '20px',
      color: '#ffd700'
    }).setOrigin(0.5);

    this.add.text(400, 310, `金币总数: ${this.gameData.gameState.totalCoins}`, {
      fontSize: '20px',
      color: '#ffd700'
    }).setOrigin(0.5);

    // 开始游戏按钮
    this.createButton(400, 400, '开始游戏', () => {
      this.gameData.resetGameState();
      this.scene.start('GameScene');
    });

    // 商店按钮
    this.createButton(400, 470, '商店', () => {
      this.scene.start('ShopScene');
    });

    // 添加键盘提示
    this.add.text(400, 560, '操作: 方向键移动 | 空格跳跃 | J攻击 | P暂停', {
      fontSize: '14px',
      color: '#666666'
    }).setOrigin(0.5);

    // 添加简单的动画效果
    this.tweens.add({
      targets: title,
      y: 140,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  private createButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, text, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#3498db',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive();

    button.on('pointerover', () => {
      button.setStyle({ backgroundColor: '#2980b9' });
    });

    button.on('pointerout', () => {
      button.setStyle({ backgroundColor: '#3498db' });
    });

    button.on('pointerdown', onClick);

    return button;
  }
}
