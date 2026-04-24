import Phaser from 'phaser';
import { GameData } from '../managers/GameData';

export class TutorialScene extends Phaser.Scene {
  private gameData: GameData;
  private currentStep: number = 0;
  private totalSteps: number = 6;
  private tutorialText!: Phaser.GameObjects.Text;
  private nextButton!: Phaser.GameObjects.Text;
  private skipButton!: Phaser.GameObjects.Text;
  private skipUnderline!: Phaser.GameObjects.Rectangle;

  private tutorialSteps: { title: string; content: string }[] = [
    {
      title: '欢迎来到火柴人跑酷大战！',
      content: '这是一款结合跑酷与战斗的火柴人游戏。\n你需要操控火柴人在各种场景中奔跑，\n躲避障碍物，击败敌人，收集金币！'
    },
    {
      title: '基本移动操作',
      content: '使用键盘方向键控制火柴人移动：\n← 向左移动\n→ 向右移动\n或者使用 A/D 键进行移动'
    },
    {
      title: '跳跃操作',
      content: '按下空格键或W键可以让火柴人跳跃。\n跳跃可以帮助你躲避障碍物和敌人。\n时机很重要，多加练习！'
    },
    {
      title: '攻击操作',
      content: '按下J键或K键可以发起攻击。\n攻击可以击败前方的敌人火柴人。\n注意攻击有冷却时间，需要合理使用。'
    },
    {
      title: '收集道具',
      content: '游戏中会出现各种道具：\n💰 金币 - 用于购买皮肤和道具\n⚡ 能量 - 提升移动速度\n❤️ 生命值 - 恢复血量\n收集它们来增强你的能力！'
    },
    {
      title: '游戏技巧',
      content: '随着游戏进行，速度会逐渐加快。\n障碍物和敌人也会越来越多。\n保持专注，创造你的最高记录！\n\n按 P 键可以暂停游戏。'
    }
  ];

  constructor() {
    super({ key: 'TutorialScene' });
    this.gameData = GameData.getInstance();
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x1a1a2e);

    this.add.text(400, 80, '新手引导', {
      fontSize: '36px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.updateStepIndicator();

    this.tutorialText = this.add.text(400, 250, '', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);

    this.nextButton = this.add.text(400, 450, '下一步', {
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#3498db',
      padding: { x: 40, y: 15 }
    }).setOrigin(0.5).setInteractive();

    this.nextButton.on('pointerover', () => {
      this.nextButton.setStyle({ backgroundColor: '#2980b9' });
    });

    this.nextButton.on('pointerout', () => {
      this.nextButton.setStyle({ backgroundColor: '#3498db' });
    });

    this.nextButton.on('pointerdown', () => {
      this.nextStep();
    });

    this.skipButton = this.add.text(400, 520, '跳过引导', {
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5).setInteractive();

    const bounds = this.skipButton.getBounds();
    this.skipUnderline = this.add.rectangle(
      bounds.centerX,
      bounds.bottom + 2,
      bounds.width,
      1,
      0x888888
    ).setOrigin(0.5, 0);

    this.skipButton.on('pointerover', () => {
      this.skipButton.setStyle({ color: '#aaaaaa' });
      this.skipUnderline.setFillStyle(0xaaaaaa);
    });

    this.skipButton.on('pointerout', () => {
      this.skipButton.setStyle({ color: '#888888' });
      this.skipUnderline.setFillStyle(0x888888);
    });

    this.skipButton.on('pointerdown', () => {
      this.completeTutorial();
    });

    this.showStep(0);
  }

  private updateStepIndicator(): void {
    for (let i = 0; i < this.totalSteps; i++) {
      const isCurrent = i === this.currentStep;
      const isPast = i < this.currentStep;
      
      const color = isCurrent ? 0x3498db : (isPast ? 0x2ecc71 : 0x555555);
      this.add.circle(280 + i * 50, 140, 8, color);
    }
  }

  private showStep(step: number): void {
    this.children.list.filter(child => child.type === 'Arc').forEach(child => child.destroy());
    
    this.currentStep = step;
    const stepData = this.tutorialSteps[step];
    
    this.updateStepIndicator();
    
    this.tutorialText.setText(`${stepData.title}\n\n${stepData.content}`);
    
    if (step === this.totalSteps - 1) {
      this.nextButton.setText('开始游戏');
    } else {
      this.nextButton.setText('下一步');
    }
  }

  private nextStep(): void {
    if (this.currentStep < this.totalSteps - 1) {
      this.showStep(this.currentStep + 1);
    } else {
      this.completeTutorial();
    }
  }

  private completeTutorial(): void {
    this.gameData.gameState.tutorialCompleted = true;
    this.gameData.saveData();
    this.scene.start('MenuScene');
  }
}
