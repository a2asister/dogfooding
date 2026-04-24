import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // 这里可以加载启动场景的资源（如加载进度条图片）
    // 目前使用简单的颜色作为进度条
  }

  create(): void {
    this.scene.start('PreloadScene');
  }
}
