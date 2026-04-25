import type { Block, CharacterState, Direction, Level, Position, BlockType } from '@/types';

export const getNextPosition = (position: Position, direction: Direction, steps: number = 1): Position => {
  const { x, y } = position;
  switch (direction) {
    case 'up':
      return { x, y: y - steps };
    case 'down':
      return { x, y: y + steps };
    case 'left':
      return { x: x - steps, y };
    case 'right':
      return { x: x + steps, y };
    default:
      return position;
  }
};

export const turnLeft = (direction: Direction): Direction => {
  const directions: Direction[] = ['up', 'left', 'down', 'right'];
  const currentIndex = directions.indexOf(direction);
  return directions[(currentIndex + 1) % 4];
};

export const turnRight = (direction: Direction): Direction => {
  const directions: Direction[] = ['up', 'right', 'down', 'left'];
  const currentIndex = directions.indexOf(direction);
  return directions[(currentIndex + 1) % 4];
};

export const isPositionValid = (position: Position, level: Level): boolean => {
  const { gridSize, obstacles } = level;
  if (position.x < 0 || position.x >= gridSize.width) return false;
  if (position.y < 0 || position.y >= gridSize.height) return false;
  if (obstacles.some((obs) => obs.x === position.x && obs.y === position.y)) return false;
  return true;
};

export const isPositionGoal = (position: Position, level: Level): boolean => {
  return position.x === level.goalPosition.x && position.y === level.goalPosition.y;
};

export const executeBlock = (
  blockType: BlockType,
  currentState: CharacterState,
  level: Level
): { state: CharacterState; valid: boolean } => {
  let newState = { ...currentState };
  let valid = true;

  switch (blockType) {
    case 'move': {
      const nextPos = getNextPosition(currentState.position, currentState.direction);
      if (isPositionValid(nextPos, level)) {
        newState.position = nextPos;
      } else {
        valid = false;
      }
      break;
    }
    case 'turnLeft':
      newState.direction = turnLeft(currentState.direction);
      break;
    case 'turnRight':
      newState.direction = turnRight(currentState.direction);
      break;
    case 'jump': {
      const nextPos = getNextPosition(currentState.position, currentState.direction, 2);
      if (isPositionValid(nextPos, level)) {
        newState.position = nextPos;
        newState.isJumping = true;
      } else {
        valid = false;
      }
      break;
    }
    default:
      break;
  }

  return { state: newState, valid };
};

export const expandBlocks = (blocks: Block[]): BlockType[] => {
  const expanded: BlockType[] = [];
  
  blocks.forEach((block) => {
    if (block.type === 'loop' && block.count) {
      const loopIndex = blocks.indexOf(block);
      const blocksToRepeat = blocks.slice(loopIndex + 1);
      const nextLoopIndex = blocksToRepeat.findIndex((b) => b.type === 'loop');
      const actualBlocksToRepeat = nextLoopIndex >= 0 ? blocksToRepeat.slice(0, nextLoopIndex) : blocksToRepeat;
      
      for (let i = 0; i < block.count; i++) {
        actualBlocksToRepeat.forEach((b) => {
          if (b.type !== 'loop') {
            expanded.push(b.type);
          }
        });
      }
    } else if (block.type !== 'loop') {
      expanded.push(block.type);
    }
  });

  return expanded;
};

export const runProgram = async (
  blocks: Block[],
  level: Level,
  onStep: (state: CharacterState, stepIndex: number) => void,
  onComplete: (success: boolean) => void,
  stepDelay: number = 500
): Promise<void> => {
  const expandedBlocks = expandBlocks(blocks);
  let currentState: CharacterState = {
    position: { ...level.startPosition },
    direction: level.startDirection,
    isJumping: false,
  };

  onStep(currentState, -1);

  for (let i = 0; i < expandedBlocks.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, stepDelay));
    
    const result = executeBlock(expandedBlocks[i], currentState, level);
    
    if (!result.valid) {
      onComplete(false);
      return;
    }
    
    currentState = result.state;
    onStep(currentState, i);
    
    if (isPositionGoal(currentState.position, level)) {
      await new Promise((resolve) => setTimeout(resolve, stepDelay));
      onComplete(true);
      return;
    }
  }

  const success = isPositionGoal(currentState.position, level);
  onComplete(success);
};
