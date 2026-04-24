import Phaser from 'phaser';
import { GameData } from '../managers/GameData';

export class GameOverScene extends Phaser.Scene {
  private gameData: GameData;

  constructor() {
    super({ key: 'GameOverScene' });
    this.gameData = GameData.getInstance();
  }

  create(): void {
    // 设置背景
    this.cameras.main.setBackgroundColor(0x1a1a2e);
    
    // 添加半透明覆盖层
    this.add.rectangle(
      400,
      300,
      800,
      600,
      0x000000,
      0.7
    );
    
    // 游戏结束标题
    const title = this.add.text(400, 150, '游戏结束', {
      fontSize: '48px',
      color: '#e74c3c',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 分数显示
    this.add.text(400, 230, '本局分数', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    
    const scoreText = this.add.text(400, 265, `${this.gameData.gameState.score}`, {
      fontSize: '36px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 距离显示
    this.add.text(250, 330, '奔跑距离', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    
    const distanceText = this.add.text(250, 360, `${Math.floor(this.gameData.gameState.distance)}m`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // 金币显示
    this.add.text(550, 330, '获得金币', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    
    const coinText = this.add.text(550, 360, `${this.gameData.gameState.coins}`, {
      fontSize: '24px',
      color: '#ffd700'
    }).setOrigin(0.5);
    
    // 最高记录
    const isNewRecord = this.gameData.gameState.distance >= this.gameData.gameState.maxDistance;
    
    if (isNewRecord) {
      this.add.text(400, 410, '🎉 新纪录！', {
        fontSize: '24px',
        color: '#2ecc71',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    } else {
      this.add.text(400, 410, `最高记录: ${Math.floor(this.gameData.gameState.maxDistance)}m`, {
        fontSize: '18px',
        color: '#888888'
      }).setOrigin(0.5);
    }
    
    // 重新开始按钮
    this.createButton(
      300,
      480,
      '再来一局',
      () => {
        this.scene.start('GameScene');
      }
    );
    
    // 返回菜单按钮
    this.createButton(
      500,
      480,
      '返回菜单',
      () => {
        this.scene.start('MenuScene');
      }
    );
    
    // 分享按钮
    this.createButton(
      400,
      540,
      '分享成绩',
      () => {
        this.shareScore();
      },
      '#27ae60'
    );
    
    // 添加动画效果
    this.tweens.add({
      targets: title,
      scale: { from: 0.5, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 800,
      ease: 'Back.out'
    });
    
    this.tweens.add({
      targets: [scoreText, distanceText, coinText],
      scale: { from: 0.8, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 600,
      delay: 300,
      ease: 'Back.out'
    });
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    bgColor: string = '#3498db'
  ): Phaser.GameObjects.Text {
    const colorMap: Record<string, string> = {
      '#3498db': '#2980b9',
      '#27ae60': '#229954',
      '#e74c3c': '#c0392b'
    };
    
    const hoverColor = colorMap[bgColor] || '#2980b9';
    
    const button = this.add.text(x, y, text, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: bgColor,
      padding: { x: 25, y: 12 }
    }).setOrigin(0.5).setInteractive();
    
    button.on('pointerover', () => {
      button.setStyle({ backgroundColor: hoverColor });
    });
    
    button.on('pointerout', () => {
      button.setStyle({ backgroundColor: bgColor });
    });
    
    button.on('pointerdown', onClick);
    
    return button;
  }

  private shareScore(): void {
    const score = this.gameData.gameState.score;
    const distance = Math.floor(this.gameData.gameState.distance);
    const coins = this.gameData.gameState.coins;
    
    const shareText = `🎮 火柴人跑酷大战
我刚刚跑了 ${distance}m，获得了 ${score} 分，收集了 ${coins} 个金币！
快来挑战我的记录吧！`;
    
    const shareUrl = window.location.href;
    
    const showToast = (message: string, isSuccess: boolean = true) => {
      const toast = this.add.text(400, 300, message, {
        fontSize: '18px',
        color: isSuccess ? '#2ecc71' : '#e74c3c',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: toast,
        alpha: { from: 1, to: 0 },
        y: 250,
        duration: 2000,
        delay: 1000,
        onComplete: () => {
          toast.destroy();
        }
      });
    };
    
    const fallbackToTextarea = () => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (success) {
          showToast('成绩已复制到剪贴板！');
        } else {
          showToast('复制失败，请手动复制成绩', false);
        }
      } catch (e) {
        console.log('复制失败:', e);
        showToast('复制失败，请手动复制成绩', false);
      }
    };
    
    const fallbackCopy = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText)
          .then(() => {
            showToast('成绩已复制到剪贴板！');
          })
          .catch(() => {
            fallbackToTextarea();
          });
      } else {
        fallbackToTextarea();
      }
    };
    
    if (navigator.share) {
      navigator.share({
        title: '火柴人跑酷大战 - 我的成绩',
        text: shareText,
        url: shareUrl
      }).catch((error) => {
        if (error.name !== 'AbortError') {
          console.log('分享失败:', error);
          fallbackCopy();
        }
      });
    } else {
      fallbackCopy();
    }
  }
}
