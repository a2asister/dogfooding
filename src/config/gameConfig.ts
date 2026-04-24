import { PlayerSkin, PowerUp, SceneTheme } from '../types';

export const GAME_CONFIG = {
  width: 800,
  height: 600,
  gravity: 800,
  player: {
    width: 40,
    height: 80,
    speed: 200,
    jumpForce: -500,
    attackDuration: 300,
    attackCooldown: 500,
    attackRange: 60,
    attackDamage: 25,
    maxHealth: 100,
    invincibleDuration: 2000
  },
  game: {
    baseSpeed: 200,
    maxSpeed: 600,
    speedIncreaseRate: 10,
    distanceForSpeedIncrease: 500,
    spawnInterval: 2000,
    minSpawnInterval: 800
  },
  scene: {
    groundY: 520,
    skyColor: {
      city: 0x2c3e50,
      factory: 0x1a1a2e,
      jungle: 0x0d3b2c
    }
  }
};

export const INITIAL_PLAYER_SKINS: PlayerSkin[] = [
  { id: 'default', name: '默认火柴人', color: '#ffffff', outlineColor: '#000000', price: 0, owned: true },
  { id: 'blue', name: '蓝色火柴人', color: '#3498db', outlineColor: '#2980b9', price: 100, owned: false },
  { id: 'red', name: '红色火柴人', color: '#e74c3c', outlineColor: '#c0392b', price: 150, owned: false },
  { id: 'green', name: '绿色火柴人', color: '#2ecc71', outlineColor: '#27ae60', price: 200, owned: false },
  { id: 'gold', name: '黄金火柴人', color: '#f1c40f', outlineColor: '#f39c12', price: 500, owned: false }
];

export const INITIAL_POWER_UPS: PowerUp[] = [
  { id: 'shield', name: '护盾', description: '吸收一次伤害', price: 50, quantity: 0, effect: 'shield', duration: 0 },
  { id: 'doubleCoin', name: '双倍金币', description: '30秒内金币双倍', price: 100, quantity: 0, effect: 'doubleCoin', duration: 30000 },
  { id: 'invincible', name: '短暂无敌', description: '5秒内无敌', price: 150, quantity: 0, effect: 'invincible', duration: 5000 }
];

export const SCENE_THEMES: SceneTheme[] = ['city', 'factory', 'jungle'];

export const THEME_NAMES: Record<SceneTheme, string> = {
  city: '城市街道',
  factory: '废弃工厂',
  jungle: '丛林深处'
};
