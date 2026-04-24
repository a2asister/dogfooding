export interface PlayerState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isJumping: boolean;
  isAttacking: boolean;
  isRunning: boolean;
  health: number;
  maxHealth: number;
  isInvincible: boolean;
  speedMultiplier: number;
  skin: PlayerSkin;
}

export interface PlayerSkin {
  id: string;
  name: string;
  color: string;
  outlineColor: string;
  price: number;
  owned: boolean;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  health: number;
  maxHealth: number;
  isDead: boolean;
  type: 'normal' | 'fast' | 'tank';
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spike' | 'falling' | 'barrier';
  isActive: boolean;
}

export interface Collectible {
  id: number;
  x: number;
  y: number;
  type: 'coin' | 'energy' | 'health';
  value: number;
  isCollected: boolean;
}

export interface GameState {
  score: number;
  coins: number;
  totalCoins: number;
  distance: number;
  maxDistance: number;
  level: number;
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  gameSpeed: number;
  baseGameSpeed: number;
  sceneTheme: SceneTheme;
  tutorialCompleted: boolean;
}

export type SceneTheme = 'city' | 'factory' | 'jungle';

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  effect: 'shield' | 'doubleCoin' | 'invincible';
  duration: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
}
