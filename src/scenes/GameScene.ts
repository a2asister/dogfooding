import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { Enemy } from '../objects/Enemy';
import { Obstacle } from '../objects/Obstacle';
import { Collectible } from '../objects/Collectible';
import { GameData } from '../managers/GameData';
import { GAME_CONFIG, THEME_NAMES } from '../config/gameConfig';
import { SceneTheme } from '../types';

export class GameScene extends Phaser.Scene {
  private gameData: GameData;
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private collectibles!: Phaser.Physics.Arcade.Group;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private groundTiles: Phaser.GameObjects.Rectangle[] = [];
  private backgroundElements!: Phaser.GameObjects.Group;
  private currentTheme!: SceneTheme;
  private themeChangeDistance: number = 2000;
  private nextThemeChange: number = 2000;
  
  private scoreText!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
  private distanceText!: Phaser.GameObjects.Text;
  private healthBar!: Phaser.GameObjects.Graphics;
  private themeText!: Phaser.GameObjects.Text;
  private pauseOverlay!: Phaser.GameObjects.Container;
  private isPaused: boolean = false;
  
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyJ!: Phaser.Input.Keyboard.Key;
  private keyK!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  
  private lastPlayerX: number = 100;
  private nextSpawnX: number = 800;
  private spawnDistance: number = 300;
  private groundTileWidth: number = 400;

  constructor() {
    super({ key: 'GameScene' });
    this.gameData = GameData.getInstance();
  }

  create(): void {
    this.gameData.resetGameState();
    this.gameData.gameState.isPlaying = true;
    this.currentTheme = 'city';
    this.nextThemeChange = this.themeChangeDistance;
    this.lastPlayerX = 100;
    this.nextSpawnX = 800;
    
    this.createInputKeys();
    this.createPhysicsGroups();
    this.createGround();
    this.updateBackground();
    this.createBackgroundElements();
    this.createPlayer();
    this.setupCamera();
    this.createUI();
    this.createPauseOverlay();
    this.setupCollisions();
    
    this.spawnInitialEntities();
    
    this.input.keyboard?.on('keydown-P', () => {
      this.togglePause();
    });
  }

  private createInputKeys(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyJ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.keyK = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.keySpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  private createPhysicsGroups(): void {
    this.enemies = this.physics.add.group({ runChildUpdate: true });
    this.obstacles = this.physics.add.group({ runChildUpdate: true });
    this.collectibles = this.physics.add.group({ runChildUpdate: true });
    this.platforms = this.physics.add.staticGroup();
    this.backgroundElements = this.add.group();
  }

  private createGround(): void {
    this.groundTiles = [];
    
    for (let i = 0; i < 5; i++) {
      const x = i * this.groundTileWidth + this.groundTileWidth / 2;
      this.createGroundTile(x);
    }
  }

  private createGroundTile(x: number): void {
    const groundColors: Record<SceneTheme, number> = {
      city: 0x4a4a4a,
      factory: 0x3a3a3a,
      jungle: 0x2d5a27
    };
    
    const ground = this.add.rectangle(
      x,
      GAME_CONFIG.scene.groundY + 40,
      this.groundTileWidth,
      80,
      groundColors[this.currentTheme]
    );
    this.groundTiles.push(ground);
    
    const groundPhysics = this.platforms.create(
      x,
      GAME_CONFIG.scene.groundY + 40,
      'ground'
    ) as Phaser.Physics.Arcade.Sprite;
    
    groundPhysics.displayWidth = this.groundTileWidth;
    groundPhysics.displayHeight = 80;
    groundPhysics.setVisible(false);
    groundPhysics.refreshBody();
  }

  private createBackgroundElements(): void {
    for (let i = 0; i < 10; i++) {
      this.createBuilding(i * 200 + 100, 0.3);
      this.createBuilding(i * 200 + 150, 0.5);
    }
  }

  private createBuilding(x: number, scale: number): void {
    const height = 100 + Math.random() * 150;
    const width = 60 + Math.random() * 80;
    
    const building = this.add.rectangle(
      x,
      GAME_CONFIG.scene.groundY - height / 2,
      width,
      height,
      this.getThemeBuildingColor()
    );
    
    building.setAlpha(0.5 + scale * 0.3);
    building.setData('scale', scale);
    this.backgroundElements.add(building);
  }

  private getThemeBuildingColor(): number {
    switch (this.currentTheme) {
      case 'city':
        return 0x34495e;
      case 'factory':
        return 0x2c2c2c;
      case 'jungle':
        return 0x1a472a;
      default:
        return 0x34495e;
    }
  }

  private updateBackground(): void {
    const skyColor = GAME_CONFIG.scene.skyColor[this.currentTheme];
    this.cameras.main.setBackgroundColor(skyColor);
    
    const groundColors: Record<SceneTheme, number> = {
      city: 0x4a4a4a,
      factory: 0x3a3a3a,
      jungle: 0x2d5a27
    };
    
    this.groundTiles.forEach(tile => {
      tile.setFillStyle(groundColors[this.currentTheme]);
    });
  }

  private createPlayer(): void {
    this.player = new Player(this, 100, GAME_CONFIG.scene.groundY - 80);
    this.add.existing(this.player);
    this.physics.add.existing(this.player);
    
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setCollideWorldBounds(false);
    playerBody.setSize(30, 70);
    playerBody.setOffset(5, 10);
  }

  private setupCamera(): void {
    this.cameras.main.startFollow(
      this.player,
      false,
      0.1,
      0.1,
      -200,
      0
    );
    
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, GAME_CONFIG.height);
  }

  private createUI(): void {
    this.scoreText = this.add.text(20, 20, '分数: 0', {
      fontSize: '20px',
      color: '#ffffff'
    }).setScrollFactor(0);
    
    this.coinText = this.add.text(20, 50, '💰 0', {
      fontSize: '18px',
      color: '#ffd700'
    }).setScrollFactor(0);
    
    this.distanceText = this.add.text(20, 80, '距离: 0m', {
      fontSize: '18px',
      color: '#ffffff'
    }).setScrollFactor(0);
    
    this.healthBar = this.add.graphics().setScrollFactor(0);
    this.updateHealthBar();
    
    this.themeText = this.add.text(
      GAME_CONFIG.width - 20,
      20,
      THEME_NAMES[this.currentTheme],
      {
        fontSize: '16px',
        color: '#aaaaaa'
      }
    ).setOrigin(1, 0).setScrollFactor(0);
  }

  private updateHealthBar(): void {
    this.healthBar.clear();
    
    const barWidth = 200;
    const barHeight = 20;
    const x = GAME_CONFIG.width - barWidth - 20;
    const y = 50;
    
    this.healthBar.fillStyle(0x333333);
    this.healthBar.fillRect(x, y, barWidth, barHeight);
    
    const healthPercent = this.gameData.playerState.health / this.gameData.playerState.maxHealth;
    const healthColor = healthPercent > 0.5 ? 0x2ecc71 : (healthPercent > 0.25 ? 0xf39c12 : 0xe74c3c);
    
    this.healthBar.fillStyle(healthColor);
    this.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight);
    
    this.healthBar.lineStyle(2, 0xffffff);
    this.healthBar.strokeRect(x, y, barWidth, barHeight);
    
    this.add.text(
      GAME_CONFIG.width - 20,
      y + barHeight / 2,
      `${Math.floor(this.gameData.playerState.health)}/${this.gameData.playerState.maxHealth}`,
      {
        fontSize: '14px',
        color: '#ffffff'
      }
    ).setOrigin(1, 0.5).setScrollFactor(0);
  }

  private createPauseOverlay(): void {
    this.pauseOverlay = this.add.container(0, 0).setScrollFactor(0);
    this.pauseOverlay.setVisible(false);
    
    const overlay = this.add.rectangle(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      GAME_CONFIG.width,
      GAME_CONFIG.height,
      0x000000,
      0.7
    );
    this.pauseOverlay.add(overlay);
    
    const pauseText = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 - 50,
      '游戏暂停',
      {
        fontSize: '40px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    this.pauseOverlay.add(pauseText);
    
    const resumeButton = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 + 30,
      '继续游戏',
      {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#3498db',
        padding: { x: 30, y: 15 }
      }
    ).setOrigin(0.5).setInteractive();
    
    resumeButton.on('pointerover', () => {
      resumeButton.setStyle({ backgroundColor: '#2980b9' });
    });
    
    resumeButton.on('pointerout', () => {
      resumeButton.setStyle({ backgroundColor: '#3498db' });
    });
    
    resumeButton.on('pointerdown', () => {
      this.togglePause();
    });
    
    this.pauseOverlay.add(resumeButton);
    
    const menuButton = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 + 100,
      '返回菜单',
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#e74c3c',
        padding: { x: 30, y: 12 }
      }
    ).setOrigin(0.5).setInteractive();
    
    menuButton.on('pointerover', () => {
      menuButton.setStyle({ backgroundColor: '#c0392b' });
    });
    
    menuButton.on('pointerout', () => {
      menuButton.setStyle({ backgroundColor: '#e74c3c' });
    });
    
    menuButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
    
    this.pauseOverlay.add(menuButton);
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    this.gameData.gameState.isPaused = this.isPaused;
    this.pauseOverlay.setVisible(this.isPaused);
    
    if (this.isPaused) {
      this.physics.world.pause();
    } else {
      this.physics.world.resume();
    }
  }

  private setupCollisions(): void {
    this.physics.add.collider(this.player, this.platforms, () => {
      this.onPlayerLand();
    }, undefined, this);
    
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.collectibles, this.platforms);
    
    this.physics.add.overlap(
      this.player, 
      this.enemies, 
      (_obj1, _obj2) => {
        const enemy = _obj2 as Enemy;
        this.onPlayerEnemyCollision(enemy);
      }, 
      undefined, 
      this
    );
    
    this.physics.add.overlap(
      this.player, 
      this.obstacles, 
      (_obj1, _obj2) => {
        const obstacle = _obj2 as Obstacle;
        this.onPlayerObstacleCollision(obstacle);
      }, 
      undefined, 
      this
    );
    
    this.physics.add.overlap(
      this.player, 
      this.collectibles, 
      (_obj1, _obj2) => {
        const collectible = _obj2 as Collectible;
        this.onPlayerCollectibleCollision(collectible);
      }, 
      undefined, 
      this
    );
  }

  private onPlayerLand(): void {
    this.gameData.playerState.isJumping = false;
    this.player.setJumping(false);
  }

  private onPlayerEnemyCollision(enemy: Enemy): void {
    if (this.gameData.playerState.isAttacking) {
      enemy.takeDamage(GAME_CONFIG.player.attackDamage);
      
      if (enemy.isDead) {
        this.gameData.gameState.score += 50;
        enemy.destroy();
      }
    } else if (!this.gameData.playerState.isInvincible) {
      if (this.gameData.shieldActive) {
        this.gameData.shieldActive = false;
        this.gameData.activePowerUp = null;
      } else {
        this.takeDamage(20);
      }
    }
  }

  private onPlayerObstacleCollision(obstacle: Obstacle): void {
    if (!obstacle.isActive) return;
    
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const obstacleBody = obstacle.body as Phaser.Physics.Arcade.Body;
    
    const playerBottom = this.player.y + playerBody.height;
    const obstacleTop = obstacle.y - obstacleBody.height;
    
    if (playerBody.velocity.y > 0 && playerBottom < obstacleTop + 20) {
      playerBody.setVelocityY(GAME_CONFIG.player.jumpForce * 0.5);
      obstacle.isActive = false;
      this.gameData.gameState.score += 10;
    } else if (!this.gameData.playerState.isInvincible) {
      if (this.gameData.shieldActive) {
        this.gameData.shieldActive = false;
        this.gameData.activePowerUp = null;
      } else {
        this.takeDamage(30);
      }
    }
  }

  private onPlayerCollectibleCollision(collectible: Collectible): void {
    if (collectible.isCollected) return;
    
    collectible.collect();
    
    switch (collectible.collectibleType) {
      case 'coin':
        this.gameData.addCoins(1);
        break;
      case 'energy':
        this.gameData.playerState.speedMultiplier = 1.5;
        this.time.delayedCall(5000, () => {
          this.gameData.playerState.speedMultiplier = 1;
        });
        break;
      case 'health':
        this.gameData.playerState.health = Math.min(
          this.gameData.playerState.health + 30,
          this.gameData.playerState.maxHealth
        );
        this.updateHealthBar();
        break;
    }
  }

  private takeDamage(amount: number): void {
    this.gameData.playerState.health -= amount;
    this.gameData.playerState.isInvincible = true;
    this.player.setInvincible(true);
    
    this.updateHealthBar();
    
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.player.setAlpha(1);
      }
    });
    
    this.time.delayedCall(GAME_CONFIG.player.invincibleDuration, () => {
      this.gameData.playerState.isInvincible = false;
      this.player.setInvincible(false);
    });
    
    if (this.gameData.playerState.health <= 0) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    this.gameData.gameState.isPlaying = false;
    this.gameData.gameState.isGameOver = true;
    
    if (this.gameData.gameState.distance > this.gameData.gameState.maxDistance) {
      this.gameData.gameState.maxDistance = this.gameData.gameState.distance;
    }
    
    this.gameData.saveData();
    this.scene.start('GameOverScene');
  }

  private spawnInitialEntities(): void {
    for (let x = 600; x < 2000; x += this.spawnDistance) {
      this.spawnEntityAt(x);
    }
    this.nextSpawnX = 2000;
  }

  private spawnEntityAt(x: number): void {
    const random = Math.random();
    const groundY = GAME_CONFIG.scene.groundY;
    
    if (random < 0.3) {
      const enemy = new Enemy(this, x, groundY - 70);
      this.enemies.add(enemy);
      this.physics.add.existing(enemy);
      
      const body = enemy.body as Phaser.Physics.Arcade.Body;
      body.setImmovable(true);
      body.setVelocityX(0);
      
    } else if (random < 0.5) {
      const types: ('spike' | 'barrier')[] = ['spike', 'barrier'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const obstacle = new Obstacle(this, x, groundY, type);
      this.obstacles.add(obstacle);
      this.physics.add.existing(obstacle, true);
      
    } else if (random < 0.85) {
      const yOffset = Math.random() * 150 + 50;
      const collectible = new Collectible(this, x, groundY - yOffset, 'coin');
      this.collectibles.add(collectible);
      this.physics.add.existing(collectible);
      
    } else if (random < 0.95) {
      const yOffset = Math.random() * 100 + 80;
      const collectible = new Collectible(this, x, groundY - yOffset, 'energy');
      this.collectibles.add(collectible);
      this.physics.add.existing(collectible);
      
    } else {
      const yOffset = Math.random() * 100 + 100;
      const collectible = new Collectible(this, x, groundY - yOffset, 'health');
      this.collectibles.add(collectible);
      this.physics.add.existing(collectible);
    }
  }

  private checkThemeChange(): void {
    if (this.gameData.gameState.distance >= this.nextThemeChange) {
      const themes: SceneTheme[] = ['city', 'factory', 'jungle'];
      const currentIndex = themes.indexOf(this.currentTheme);
      const newIndex = (currentIndex + 1) % themes.length;
      this.currentTheme = themes[newIndex];
      
      this.updateBackground();
      this.themeText.setText(THEME_NAMES[this.currentTheme]);
      
      this.nextThemeChange += this.themeChangeDistance;
    }
  }

  private expandWorld(): void {
    const currentX = this.player.x;
    
    while (this.nextSpawnX - currentX < GAME_CONFIG.width * 2) {
      const jitter = Math.random() * 100 - 50;
      this.spawnEntityAt(this.nextSpawnX + jitter);
      this.nextSpawnX += this.spawnDistance + Math.random() * 100;
    }
    
    const lastGroundTile = this.groundTiles[this.groundTiles.length - 1];
    if (lastGroundTile && currentX + GAME_CONFIG.width > lastGroundTile.x) {
      this.createGroundTile(lastGroundTile.x + this.groundTileWidth);
    }
  }

  private cleanupEntities(): void {
    const cleanupX = this.player.x - GAME_CONFIG.width;
    
    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      if (enemy.x < cleanupX || enemy.isDead) {
        enemy.destroy();
      }
    });
    
    this.obstacles.getChildren().forEach((child) => {
      const obstacle = child as Obstacle;
      if (obstacle.x < cleanupX) {
        obstacle.destroy();
      }
    });
    
    this.collectibles.getChildren().forEach((child) => {
      const collectible = child as Collectible;
      if (collectible.x < cleanupX || collectible.isCollected) {
        collectible.destroy();
      }
    });
  }

  update(_time: number, _delta: number): void {
    if (this.isPaused || !this.gameData.gameState.isPlaying) return;
    
    const currentX = this.player.x;
    const distanceDelta = Math.max(0, currentX - this.lastPlayerX);
    
    if (distanceDelta > 0) {
      this.gameData.gameState.distance += distanceDelta * 0.1;
    }
    this.lastPlayerX = currentX;
    
    this.checkThemeChange();
    
    this.scoreText.setText(`分数: ${this.gameData.gameState.score}`);
    this.coinText.setText(`💰 ${this.gameData.gameState.coins}`);
    this.distanceText.setText(`距离: ${Math.floor(this.gameData.gameState.distance)}m`);
    
    this.handlePlayerInput();
    this.expandWorld();
    this.cleanupEntities();
  }

  private handlePlayerInput(): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const speed = GAME_CONFIG.player.speed * this.gameData.playerState.speedMultiplier;
    
    let moveX = 0;
    
    if (this.cursors.left.isDown || this.keyA.isDown) {
      moveX = -1;
      this.player.setFacingLeft(true);
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      moveX = 1;
      this.player.setFacingLeft(false);
    }
    
    if (moveX !== 0) {
      playerBody.setVelocityX(moveX * speed);
      this.gameData.playerState.isRunning = true;
      this.player.setRunning(true);
    } else {
      playerBody.setVelocityX(0);
      this.gameData.playerState.isRunning = false;
      this.player.setRunning(false);
    }
    
    if ((this.cursors.up.isDown || this.keyW.isDown || this.keySpace.isDown) && 
        !this.gameData.playerState.isJumping) {
      playerBody.setVelocityY(GAME_CONFIG.player.jumpForce);
      this.gameData.playerState.isJumping = true;
      this.player.setJumping(true);
    }
    
    if ((this.keyJ.isDown || this.keyK.isDown) && 
        !this.gameData.playerState.isAttacking) {
      this.gameData.playerState.isAttacking = true;
      this.player.setAttacking(true);
      
      this.time.delayedCall(GAME_CONFIG.player.attackDuration, () => {
        this.gameData.playerState.isAttacking = false;
        this.player.setAttacking(false);
      });
    }
  }
}
