import type { Block, BlockType } from '@/types';

export const blockTemplates: Record<BlockType, Omit<Block, 'id'>> = {
  move: {
    type: 'move',
    label: '前进',
    icon: 'arrow-up',
    color: 'block-move',
  },
  turnLeft: {
    type: 'turnLeft',
    label: '左转',
    icon: 'rotate-ccw',
    color: 'block-turn',
  },
  turnRight: {
    type: 'turnRight',
    label: '右转',
    icon: 'rotate-cw',
    color: 'block-turn',
  },
  jump: {
    type: 'jump',
    label: '跳跃',
    icon: 'arrow-up-circle',
    color: 'block-jump',
  },
  loop: {
    type: 'loop',
    label: '循环',
    icon: 'repeat',
    color: 'block-loop',
    count: 2,
  },
  condition: {
    type: 'condition',
    label: '条件',
    icon: 'help-circle',
    color: 'block-condition',
  },
};

export const blockDescriptions: Record<BlockType, { name: string; description: string; emoji: string }> = {
  move: {
    name: '前进',
    description: '小兔子向前走一格',
    emoji: '🐾',
  },
  turnLeft: {
    name: '左转',
    description: '小兔子向左转90度',
    emoji: '🔄',
  },
  turnRight: {
    name: '右转',
    description: '小兔子向右转90度',
    emoji: '🔄',
  },
  jump: {
    name: '跳跃',
    description: '小兔子跳过一格障碍物',
    emoji: '🦘',
  },
  loop: {
    name: '循环',
    description: '重复执行后面的动作',
    emoji: '🔁',
  },
  condition: {
    name: '条件',
    description: '根据条件执行不同动作',
    emoji: '❓',
  },
};

export const createBlock = (type: BlockType): Block => {
  const template = blockTemplates[type];
  return {
    ...template,
    id: `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  };
};
