export type BlockType = 'move' | 'turnLeft' | 'turnRight' | 'jump' | 'loop' | 'condition';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface Block {
  id: string;
  type: BlockType;
  label: string;
  icon: string;
  color: string;
  count?: number;
}

export interface CharacterState {
  position: Position;
  direction: Direction;
  isJumping: boolean;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  gridSize: { width: number; height: number };
  startPosition: Position;
  startDirection: Direction;
  goalPosition: Position;
  obstacles: Position[];
  availableBlocks: BlockType[];
  hint: string;
  maxSteps: number;
}

export interface GameState {
  currentLevel: number;
  blocks: Block[];
  isRunning: boolean;
  isCompleted: boolean;
  steps: number;
  unlockedLevels: number[];
  completedLevels: number[];
}

export interface Progress {
  unlockedLevels: number[];
  completedLevels: number[];
  totalStars: number;
  levelStars: Record<number, number>;
  playTime: number;
}
