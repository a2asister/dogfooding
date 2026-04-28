import { ElementType } from '../types';

export const SNAP_THRESHOLD = 10;

export function snapToGrid(value: number, gridSize: number = 20): number {
  return Math.round(value / gridSize) * gridSize;
}

export function snapToElement(
  x: number, 
  y: number, 
  currentElementId: string,
  elements: Array<{ id: string; x: number; y: number; width: number; height: number }>
): { x: number; y: number; snapLines: Array<{ type: 'horizontal' | 'vertical'; position: number }> } {
  let snappedX = x;
  let snappedY = y;
  const snapLines: Array<{ type: 'horizontal' | 'vertical'; position: number }> = [];

  const otherElements = elements.filter(el => el.id !== currentElementId);

  for (const el of otherElements) {
    const elLeft = el.x;
    const elRight = el.x + el.width;
    const elCenterX = el.x + el.width / 2;
    const elTop = el.y;
    const elBottom = el.y + el.height;
    const elCenterY = el.y + el.height / 2;

    const distancesX = [
      { value: x, target: elLeft },
      { value: x, target: elRight },
      { value: x, target: elCenterX },
      { value: x + 100, target: elLeft },
      { value: x + 100, target: elRight },
      { value: x + 100, target: elCenterX }
    ];

    const distancesY = [
      { value: y, target: elTop },
      { value: y, target: elBottom },
      { value: y, target: elCenterY },
      { value: y + 50, target: elTop },
      { value: y + 50, target: elBottom },
      { value: y + 50, target: elCenterY }
    ];

    for (const dist of distancesX) {
      if (Math.abs(dist.value - dist.target) < SNAP_THRESHOLD) {
        snappedX = dist.target;
        snapLines.push({ type: 'vertical', position: dist.target });
        break;
      }
    }

    for (const dist of distancesY) {
      if (Math.abs(dist.value - dist.target) < SNAP_THRESHOLD) {
        snappedY = dist.target;
        snapLines.push({ type: 'horizontal', position: dist.target });
        break;
      }
    }
  }

  return { x: snappedX, y: snappedY, snapLines };
}

export function getElementIcon(type: ElementType): string {
  const icons: Record<ElementType, string> = {
    title: 'H',
    list: '☰',
    bold: 'B',
    italic: 'I',
    link: '🔗',
    divider: '―',
    rectangle: '□',
    slide: '▣'
  };
  return icons[type];
}

export function getElementLabel(type: ElementType): string {
  const labels: Record<ElementType, string> = {
    title: '标题',
    list: '列表',
    bold: '加粗',
    italic: '斜体',
    link: '链接',
    divider: '分割线',
    rectangle: '矩形',
    slide: '幻灯片'
  };
  return labels[type];
}

export function formatNumber(value: number, decimals: number = 0): string {
  return Number(value).toFixed(decimals);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
