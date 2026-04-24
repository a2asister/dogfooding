import Phaser from 'phaser';
import { GameData } from '../managers/GameData';
import { PlayerSkin, PowerUp } from '../types';

export class ShopScene extends Phaser.Scene {
  private gameData: GameData;
  private currentTab: 'skins' | 'powerups' = 'skins';
  private coinText!: Phaser.GameObjects.Text;
  private skinsContainer!: Phaser.GameObjects.Container;
  private powerUpsContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'ShopScene' });
    this.gameData = GameData.getInstance();
  }

  create(): void {
    // 设置背景
    this.cameras.main.setBackgroundColor(0x1a1a2e);
    
    // 标题
    this.add.text(400, 60, '商店', {
      fontSize: '36px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 金币显示
    this.coinText = this.add.text(650, 60, `💰 ${this.gameData.gameState.totalCoins}`, {
      fontSize: '24px',
      color: '#ffd700'
    }).setOrigin(0.5);
    
    // 标签按钮
    const skinsTab = this.createTabButton(280, 120, '皮肤', () => {
      this.switchTab('skins');
    });
    
    const powerUpsTab = this.createTabButton(520, 120, '道具', () => {
      this.switchTab('powerups');
    });
    
    // 创建内容容器
    this.skinsContainer = this.add.container(0, 160);
    this.powerUpsContainer = this.add.container(0, 160).setVisible(false);
    
    // 填充内容
    this.renderSkins();
    this.renderPowerUps();
    
    // 返回按钮
    this.createButton(400, 540, '返回菜单', () => {
      this.scene.start('MenuScene');
    }, '#e74c3c');
    
    this.updateTabHighlight(skinsTab, powerUpsTab);
  }

  private createTabButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void
  ): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, text, {
      fontSize: '22px',
      color: '#888888',
      backgroundColor: '#2a2a4a',
      padding: { x: 40, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    button.on('pointerover', () => {
      button.setStyle({ color: '#aaaaaa' });
    });
    
    button.on('pointerout', () => {
      if (this.currentTab === 'skins' && text === '皮肤') return;
      if (this.currentTab === 'powerups' && text === '道具') return;
      button.setStyle({ color: '#888888' });
    });
    
    button.on('pointerdown', onClick);
    
    return button;
  }

  private switchTab(tab: 'skins' | 'powerups'): void {
    this.currentTab = tab;
    this.skinsContainer.setVisible(tab === 'skins');
    this.powerUpsContainer.setVisible(tab === 'powerups');
    
    // 更新标签高亮
    this.children.list.forEach((child) => {
      if (child.type === 'Text') {
        const text = child as Phaser.GameObjects.Text;
        if (text.text === '皮肤' || text.text === '道具') {
          const isActive = (text.text === '皮肤' && tab === 'skins') ||
                          (text.text === '道具' && tab === 'powerups');
          text.setStyle({
            color: isActive ? '#ffffff' : '#888888',
            backgroundColor: isActive ? '#3498db' : '#2a2a4a'
          });
        }
      }
    });
  }

  private updateTabHighlight(skinsTab: Phaser.GameObjects.Text, powerUpsTab: Phaser.GameObjects.Text): void {
    if (this.currentTab === 'skins') {
      skinsTab.setStyle({ color: '#ffffff', backgroundColor: '#3498db' });
    } else {
      powerUpsTab.setStyle({ color: '#ffffff', backgroundColor: '#3498db' });
    }
  }

  private renderSkins(): void {
    this.skinsContainer.removeAll(true);
    
    const skins = this.gameData.playerSkins;
    const startY = 30;
    const itemHeight = 100;
    
    skins.forEach((skin, index) => {
      const y = startY + index * itemHeight;
      this.createSkinItem(skin, y);
    });
  }

  private createSkinItem(skin: PlayerSkin, y: number): void {
    const isOwned = skin.owned;
    const isSelected = skin.id === this.gameData.playerState.skin.id;
    const canAfford = this.gameData.gameState.totalCoins >= skin.price;
    
    // 背景
    const bg = this.add.rectangle(
      400,
      y + 40,
      700,
      80,
      isSelected ? 0x2a4a6a : 0x2a2a4a
    );
    this.skinsContainer.add(bg);
    
    // 选择框
    if (isSelected) {
      const selectBorder = this.add.rectangle(
        400,
        y + 40,
        702,
        82,
        undefined,
        0
      ).setStrokeStyle(3, 0x3498db);
      this.skinsContainer.add(selectBorder);
    }
    
    // 预览火柴人
    const preview = this.createSkinPreview(100, y + 40, skin);
    this.skinsContainer.add(preview);
    
    // 名称
    const nameText = this.add.text(180, y + 20, skin.name, {
      fontSize: '20px',
      color: '#ffffff'
    });
    this.skinsContainer.add(nameText);
    
    // 状态/价格
    let statusText: string;
    let statusColor: string;
    
    if (isOwned) {
      statusText = isSelected ? '使用中' : '已拥有';
      statusColor = isSelected ? '#2ecc71' : '#aaaaaa';
    } else {
      statusText = `💰 ${skin.price}`;
      statusColor = canAfford ? '#ffd700' : '#e74c3c';
    }
    
    const status = this.add.text(180, y + 50, statusText, {
      fontSize: '16px',
      color: statusColor
    });
    this.skinsContainer.add(status);
    
    // 按钮
    if (isOwned) {
      if (!isSelected) {
        const selectButton = this.createButton(
          620,
          y + 40,
          '选择',
          () => {
            this.gameData.selectSkin(skin.id);
            this.renderSkins();
          }
        );
        this.skinsContainer.add(selectButton);
      }
    } else {
      const buyButton = this.createButton(
        620,
        y + 40,
        '购买',
        () => {
          if (canAfford) {
            const success = this.gameData.buySkin(skin.id);
            if (success) {
              this.updateCoinDisplay();
              this.renderSkins();
            }
          }
        },
        canAfford ? '#27ae60' : '#666666'
      );
      if (!canAfford) {
        buyButton.disableInteractive();
      }
      this.skinsContainer.add(buyButton);
    }
  }

  private createSkinPreview(x: number, y: number, skin: PlayerSkin): Phaser.GameObjects.Graphics {
    const graphics = this.add.graphics();
    
    const color = Phaser.Display.Color.HexStringToColor(skin.color).color;
    graphics.lineStyle(3, color);
    graphics.fillStyle(color);
    
    // 简化的火柴人预览
    const headY = y - 25;
    graphics.strokeCircle(x, headY, 8);
    
    // 身体
    graphics.lineBetween(x, headY + 8, x, headY + 28);
    
    // 手臂
    graphics.lineBetween(x, headY + 15, x - 12, headY + 25);
    graphics.lineBetween(x, headY + 15, x + 12, headY + 25);
    
    // 腿
    graphics.lineBetween(x, headY + 28, x - 8, headY + 45);
    graphics.lineBetween(x, headY + 28, x + 8, headY + 45);
    
    return graphics;
  }

  private renderPowerUps(): void {
    this.powerUpsContainer.removeAll(true);
    
    const powerUps = this.gameData.powerUps;
    const startY = 30;
    const itemHeight = 100;
    
    powerUps.forEach((powerUp, index) => {
      const y = startY + index * itemHeight;
      this.createPowerUpItem(powerUp, y);
    });
  }

  private createPowerUpItem(powerUp: PowerUp, y: number): void {
    const canAfford = this.gameData.gameState.totalCoins >= powerUp.price;
    
    // 背景
    const bg = this.add.rectangle(
      400,
      y + 40,
      700,
      80,
      0x2a2a4a
    );
    this.powerUpsContainer.add(bg);
    
    // 图标
    const icon = this.createPowerUpIcon(100, y + 40, powerUp.effect);
    this.powerUpsContainer.add(icon);
    
    // 名称
    const nameText = this.add.text(180, y + 15, powerUp.name, {
      fontSize: '20px',
      color: '#ffffff'
    });
    this.powerUpsContainer.add(nameText);
    
    // 描述
    const descText = this.add.text(180, y + 45, powerUp.description, {
      fontSize: '14px',
      color: '#aaaaaa'
    });
    this.powerUpsContainer.add(descText);
    
    // 拥有数量
    const quantityText = this.add.text(180, y + 65, `拥有: ${powerUp.quantity}`, {
      fontSize: '14px',
      color: '#3498db'
    });
    this.powerUpsContainer.add(quantityText);
    
    // 价格
    const priceText = this.add.text(520, y + 40, `💰 ${powerUp.price}`, {
      fontSize: '18px',
      color: canAfford ? '#ffd700' : '#e74c3c'
    }).setOrigin(0.5);
    this.powerUpsContainer.add(priceText);
    
    // 购买按钮
    const buyButton = this.createButton(
      640,
      y + 40,
      '购买',
      () => {
        if (canAfford) {
          const success = this.gameData.buyPowerUp(powerUp.id);
          if (success) {
            this.updateCoinDisplay();
            this.renderPowerUps();
          }
        }
      },
      canAfford ? '#27ae60' : '#666666'
    );
    if (!canAfford) {
      buyButton.disableInteractive();
    }
    this.powerUpsContainer.add(buyButton);
  }

  private createPowerUpIcon(x: number, y: number, effect: string): Phaser.GameObjects.Graphics {
    const graphics = this.add.graphics();
    
    switch (effect) {
      case 'shield':
        graphics.fillStyle(0x3498db);
        graphics.lineStyle(3, 0x2980b9);
        graphics.beginPath();
        graphics.moveTo(x, y - 20);
        graphics.lineTo(x - 18, y - 8);
        graphics.lineTo(x - 15, y + 15);
        graphics.lineTo(x, y + 25);
        graphics.lineTo(x + 15, y + 15);
        graphics.lineTo(x + 18, y - 8);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
        break;
        
      case 'doubleCoin':
        graphics.fillStyle(0xffd700);
        graphics.lineStyle(2, 0xf39c12);
        graphics.fillCircle(x - 10, y - 5, 10);
        graphics.strokeCircle(x - 10, y - 5, 10);
        graphics.fillCircle(x + 10, y + 5, 10);
        graphics.strokeCircle(x + 10, y + 5, 10);
        graphics.lineStyle(3, 0xffffff);
        graphics.lineBetween(x - 15, y - 10, x + 5, y + 10);
        break;
        
      case 'invincible':
        graphics.fillStyle(0xf1c40f);
        graphics.lineStyle(3, 0xf39c12);
        // 星星
        graphics.beginPath();
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? 20 : 10;
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const px = x + Math.cos(angle) * radius;
          const py = y + Math.sin(angle) * radius;
          if (i === 0) {
            graphics.moveTo(px, py);
          } else {
            graphics.lineTo(px, py);
          }
        }
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
        break;
    }
    
    return graphics;
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    bgColor: string = '#3498db'
  ): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, text, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: bgColor,
      padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setInteractive();
    
    const hoverColors: Record<string, string> = {
      '#3498db': '#2980b9',
      '#27ae60': '#229954',
      '#e74c3c': '#c0392b'
    };
    
    const hoverColor = hoverColors[bgColor] || '#2980b9';
    
    button.on('pointerover', () => {
      button.setStyle({ backgroundColor: hoverColor });
    });
    
    button.on('pointerout', () => {
      button.setStyle({ backgroundColor: bgColor });
    });
    
    button.on('pointerdown', onClick);
    
    return button;
  }

  private updateCoinDisplay(): void {
    this.coinText.setText(`💰 ${this.gameData.gameState.totalCoins}`);
  }
}
