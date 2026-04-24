import { GameState, PlayerState, PlayerSkin, PowerUp, InputState, SceneTheme } from '../types';
import { INITIAL_PLAYER_SKINS, INITIAL_POWER_UPS, SCENE_THEMES } from '../config/gameConfig';

export class GameData {
  private static instance: GameData;
  
  public gameState: GameState;
  public playerState: PlayerState;
  public playerSkins: PlayerSkin[];
  public powerUps: PowerUp[];
  public inputState: InputState;
  public activePowerUp: { effect: string; endTime: number } | null = null;
  public doubleCoinActive: boolean = false;
  public shieldActive: boolean = false;
  
  private constructor() {
    this.gameState = this.getDefaultGameState();
    this.playerState = this.getDefaultPlayerState();
    this.playerSkins = JSON.parse(JSON.stringify(INITIAL_PLAYER_SKINS));
    this.powerUps = JSON.parse(JSON.stringify(INITIAL_POWER_UPS));
    this.inputState = {
      left: false,
      right: false,
      jump: false,
      attack: false
    };
    this.loadData();
  }
  
  public static getInstance(): GameData {
    if (!GameData.instance) {
      GameData.instance = new GameData();
    }
    return GameData.instance;
  }
  
  private getDefaultGameState(): GameState {
    return {
      score: 0,
      coins: 0,
      totalCoins: 0,
      distance: 0,
      maxDistance: 0,
      level: 1,
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      gameSpeed: 200,
      baseGameSpeed: 200,
      sceneTheme: 'city',
      tutorialCompleted: false
    };
  }
  
  private getDefaultPlayerState(): PlayerState {
    return {
      x: 100,
      y: 440,
      velocityX: 0,
      velocityY: 0,
      isJumping: false,
      isAttacking: false,
      isRunning: false,
      health: 100,
      maxHealth: 100,
      isInvincible: false,
      speedMultiplier: 1,
      skin: INITIAL_PLAYER_SKINS[0]
    };
  }
  
  public resetGameState(): void {
    const savedData = this.loadSavedData();
    this.gameState = {
      ...this.getDefaultGameState(),
      totalCoins: savedData?.totalCoins || 0,
      maxDistance: savedData?.maxDistance || 0,
      tutorialCompleted: savedData?.tutorialCompleted || false
    };
    this.playerState = this.getDefaultPlayerState();
    if (savedData?.playerSkins) {
      this.playerSkins = savedData.playerSkins;
    }
    if (savedData?.powerUps) {
      this.powerUps = savedData.powerUps;
    }
    this.activePowerUp = null;
    this.doubleCoinActive = false;
    this.shieldActive = false;
    
    const unlockedSkins = this.playerSkins.filter(s => s.owned);
    if (unlockedSkins.length > 0) {
      this.playerState.skin = unlockedSkins[0];
    }
  }
  
  public saveData(): void {
    const data = {
      totalCoins: this.gameState.totalCoins,
      maxDistance: this.gameState.maxDistance,
      playerSkins: this.playerSkins,
      powerUps: this.powerUps,
      tutorialCompleted: this.gameState.tutorialCompleted
    };
    localStorage.setItem('stickmanRunnerData', JSON.stringify(data));
  }
  
  private loadSavedData(): any {
    const saved = localStorage.getItem('stickmanRunnerData');
    return saved ? JSON.parse(saved) : null;
  }
  
  private loadData(): void {
    const savedData = this.loadSavedData();
    if (savedData) {
      this.gameState.totalCoins = savedData.totalCoins || 0;
      this.gameState.maxDistance = savedData.maxDistance || 0;
      this.gameState.tutorialCompleted = savedData.tutorialCompleted || false;
      if (savedData.playerSkins) {
        this.playerSkins = savedData.playerSkins;
      }
      if (savedData.powerUps) {
        this.powerUps = savedData.powerUps;
      }
    }
  }
  
  public addCoins(amount: number): void {
    const multiplier = this.doubleCoinActive ? 2 : 1;
    const finalAmount = amount * multiplier;
    this.gameState.coins += finalAmount;
    this.gameState.totalCoins += finalAmount;
    this.gameState.score += finalAmount * 10;
  }
  
  public updateDistance(delta: number): void {
    const distanceDelta = (this.gameState.gameSpeed * delta) / 1000;
    this.gameState.distance += distanceDelta;
    this.gameState.score += Math.floor(distanceDelta);
  }
  
  public getRandomTheme(): SceneTheme {
    const randomIndex = Math.floor(Math.random() * SCENE_THEMES.length);
    return SCENE_THEMES[randomIndex];
  }
  
  public buySkin(skinId: string): boolean {
    const skin = this.playerSkins.find(s => s.id === skinId);
    if (skin && !skin.owned && this.gameState.totalCoins >= skin.price) {
      this.gameState.totalCoins -= skin.price;
      skin.owned = true;
      this.saveData();
      return true;
    }
    return false;
  }
  
  public selectSkin(skinId: string): boolean {
    const skin = this.playerSkins.find(s => s.id === skinId);
    if (skin && skin.owned) {
      this.playerState.skin = skin;
      return true;
    }
    return false;
  }
  
  public buyPowerUp(powerUpId: string): boolean {
    const powerUp = this.powerUps.find(p => p.id === powerUpId);
    if (powerUp && this.gameState.totalCoins >= powerUp.price) {
      this.gameState.totalCoins -= powerUp.price;
      powerUp.quantity++;
      this.saveData();
      return true;
    }
    return false;
  }
  
  public usePowerUp(powerUpId: string): boolean {
    const powerUp = this.powerUps.find(p => p.id === powerUpId);
    if (powerUp && powerUp.quantity > 0) {
      powerUp.quantity--;
      
      switch (powerUp.effect) {
        case 'shield':
          this.shieldActive = true;
          this.activePowerUp = { effect: 'shield', endTime: 0 };
          break;
        case 'doubleCoin':
          this.doubleCoinActive = true;
          this.activePowerUp = {
            effect: 'doubleCoin',
            endTime: Date.now() + powerUp.duration
          };
          break;
        case 'invincible':
          this.playerState.isInvincible = true;
          this.activePowerUp = {
            effect: 'invincible',
            endTime: Date.now() + powerUp.duration
          };
          break;
      }
      
      this.saveData();
      return true;
    }
    return false;
  }
  
  public checkPowerUpExpiration(): void {
    if (this.activePowerUp && this.activePowerUp.endTime > 0) {
      if (Date.now() >= this.activePowerUp.endTime) {
        switch (this.activePowerUp.effect) {
          case 'doubleCoin':
            this.doubleCoinActive = false;
            break;
          case 'invincible':
            this.playerState.isInvincible = false;
            break;
        }
        this.activePowerUp = null;
      }
    }
  }
}
