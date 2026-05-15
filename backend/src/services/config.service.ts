import { Injectable } from '@nestjs/common';

export interface AnimationConfig {
  duration: number;
  ease: string;
  loop: boolean;
  flowSpeed: number;
  snapDistance: number;
}

@Injectable()
export class ConfigService {
  validate(config: AnimationConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.duration < 0.1 || config.duration > 10) {
      errors.push('动画时长必须在 0.1 到 10 秒之间');
    }

    const validEases = [
      'power1.out',
      'power2.out',
      'power3.out',
      'power4.out',
      'back.out(1.7)',
      'elastic.out(1, 0.3)',
    ];
    if (!validEases.includes(config.ease)) {
      errors.push('无效的缓动函数');
    }

    if (config.flowSpeed < 0.1 || config.flowSpeed > 10) {
      errors.push('流动速度必须在 0.1 到 10 之间');
    }

    if (config.snapDistance < 5 || config.snapDistance > 100) {
      errors.push('磁吸距离必须在 5 到 100 像素之间');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}