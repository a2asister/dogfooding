import { CHROMOSOME_COLORS, CELL_COLORS } from '../types';
import type { Point, Chromosome, Cell } from '../types';

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  center: Point,
  radius: number,
  fillColor: string,
  strokeColor?: string,
  lineWidth: number = 2
) => {
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fillColor;
  ctx.fill();
  
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
};

export const drawChromosomeArm = (
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  width: number,
  color: string,
  opacity: number = 1
) => {
  ctx.globalAlpha = opacity;
  
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const length = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
  
  ctx.save();
  ctx.translate(start.x, start.y);
  ctx.rotate(angle);
  
  ctx.beginPath();
  ctx.moveTo(0, -width / 2);
  ctx.lineTo(length * 0.8, -width / 2);
  ctx.quadraticCurveTo(length, -width / 2, length, 0);
  ctx.quadraticCurveTo(length, width / 2, length * 0.8, width / 2);
  ctx.lineTo(0, width / 2);
  ctx.closePath();
  
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.restore();
  ctx.globalAlpha = 1;
};

export const drawCentromere = (
  ctx: CanvasRenderingContext2D,
  position: Point,
  radius: number,
  opacity: number = 1
) => {
  ctx.globalAlpha = opacity;
  
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = CHROMOSOME_COLORS.centromere;
  ctx.fill();
  ctx.strokeStyle = CHROMOSOME_COLORS.centromere;
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.globalAlpha = 1;
};

export const drawChromosome = (
  ctx: CanvasRenderingContext2D,
  chromosome: Chromosome,
  scale: number = 1
) => {
  if (!chromosome.isVisible || chromosome.opacity <= 0) return;
  
  const baseWidth = 8 * scale;
  
  const maternalColor = chromosome.hasCrossedOver ? 
    CHROMOSOME_COLORS.crossingOver : 
    CHROMOSOME_COLORS.maternal;
  const paternalColor = chromosome.hasCrossedOver ? 
    CHROMOSOME_COLORS.crossingOver : 
    CHROMOSOME_COLORS.paternal;
  
  const color = chromosome.isMaternal ? maternalColor : paternalColor;
  
  drawChromosomeArm(
    ctx,
    chromosome.arms.short.start,
    chromosome.arms.short.end,
    baseWidth,
    color,
    chromosome.opacity
  );
  
  drawChromosomeArm(
    ctx,
    chromosome.arms.long.start,
    chromosome.arms.long.end,
    baseWidth,
    color,
    chromosome.opacity
  );
  
  drawCentromere(
    ctx,
    chromosome.centromerePosition,
    baseWidth * 0.8,
    chromosome.opacity
  );
  
  if (chromosome.hasCrossedOver && chromosome.crossingOverSegments.length > 0) {
    chromosome.crossingOverSegments.forEach(segment => {
      const segmentColor = segment.isMaternal ? 
        CHROMOSOME_COLORS.maternal : 
        CHROMOSOME_COLORS.paternal;
      
      const shortArmLength = Math.sqrt(
        (chromosome.arms.short.end.x - chromosome.arms.short.start.x) ** 2 +
        (chromosome.arms.short.end.y - chromosome.arms.short.start.y) ** 2
      );
      
      const longArmLength = Math.sqrt(
        (chromosome.arms.long.end.x - chromosome.arms.long.start.x) ** 2 +
        (chromosome.arms.long.end.y - chromosome.arms.long.start.y) ** 2
      );
      
      const totalLength = shortArmLength + longArmLength;
      const segmentStart = segment.start * totalLength;
      const segmentEnd = segment.end * totalLength;
      
      if (segmentStart < shortArmLength) {
        const shortSegmentStart = Math.max(0, segmentStart);
        const shortSegmentEnd = Math.min(shortArmLength, segmentEnd);
        
        if (shortSegmentEnd > shortSegmentStart) {
          const angle = Math.atan2(
            chromosome.arms.short.end.y - chromosome.arms.short.start.y,
            chromosome.arms.short.end.x - chromosome.arms.short.start.x
          );
          
          const segmentWidth = baseWidth * 0.6;
          const segmentHeight = (shortSegmentEnd - shortSegmentStart) * 0.8;
          
          ctx.globalAlpha = chromosome.opacity * 0.8;
          ctx.fillStyle = segmentColor;
          
          ctx.save();
          ctx.translate(
            chromosome.arms.short.start.x + Math.cos(angle) * shortSegmentStart,
            chromosome.arms.short.start.y + Math.sin(angle) * shortSegmentStart
          );
          ctx.rotate(angle + Math.PI / 2);
          
          ctx.fillRect(-segmentWidth / 2, 0, segmentWidth, segmentHeight);
          ctx.restore();
          ctx.globalAlpha = 1;
        }
      }
      
      if (segmentEnd > shortArmLength) {
        const longSegmentStart = Math.max(0, segmentStart - shortArmLength);
        const longSegmentEnd = segmentEnd - shortArmLength;
        
        if (longSegmentEnd > longSegmentStart) {
          const angle = Math.atan2(
            chromosome.arms.long.end.y - chromosome.arms.long.start.y,
            chromosome.arms.long.end.x - chromosome.arms.long.start.x
          );
          
          const segmentWidth = baseWidth * 0.6;
          const segmentHeight = (longSegmentEnd - longSegmentStart) * 0.8;
          
          ctx.globalAlpha = chromosome.opacity * 0.8;
          ctx.fillStyle = segmentColor;
          
          ctx.save();
          ctx.translate(
            chromosome.arms.long.start.x + Math.cos(angle) * longSegmentStart,
            chromosome.arms.long.start.y + Math.sin(angle) * longSegmentStart
          );
          ctx.rotate(angle + Math.PI / 2);
          
          ctx.fillRect(-segmentWidth / 2, 0, segmentWidth, segmentHeight);
          ctx.restore();
          ctx.globalAlpha = 1;
        }
      }
    });
  }
};

export const drawCell = (
  ctx: CanvasRenderingContext2D,
  cell: Cell,
  showNucleus: boolean = true,
  showMembrane: boolean = true
) => {
  if (!cell.isVisible) return;
  
  drawCircle(
    ctx,
    cell.position,
    cell.radius,
    CELL_COLORS.cytoplasm,
    showMembrane ? CELL_COLORS.membrane : undefined,
    2
  );
  
  if (showNucleus) {
    const nucleusRadius = cell.radius * 0.6;
    drawCircle(
      ctx,
      cell.position,
      nucleusRadius,
      CELL_COLORS.nucleus,
      CELL_COLORS.nucleusDark,
      1
    );
  }
};

export const drawSpindleFiber = (
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  opacity: number = 1
) => {
  ctx.globalAlpha = opacity;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = CELL_COLORS.spindle;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.globalAlpha = 1;
};

export const drawAnnotation = (
  ctx: CanvasRenderingContext2D,
  text: string,
  position: Point,
  fontSize: number = 14,
  color: string = '#333'
) => {
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const textWidth = ctx.measureText(text).width;
  const padding = 4;
  const backgroundHeight = fontSize + padding * 2;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(
    position.x - textWidth / 2 - padding,
    position.y - backgroundHeight / 2,
    textWidth + padding * 2,
    backgroundHeight
  );
  
  ctx.fillStyle = color;
  ctx.fillText(text, position.x, position.y);
};

export const drawEquatorialPlate = (
  ctx: CanvasRenderingContext2D,
  center: Point,
  width: number,
  opacity: number = 0.3
) => {
  ctx.globalAlpha = opacity;
  ctx.beginPath();
  ctx.moveTo(center.x - width / 2, center.y);
  ctx.lineTo(center.x + width / 2, center.y);
  ctx.strokeStyle = '#757575';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
};

export const interpolatePoint = (start: Point, end: Point, progress: number): Point => ({
  x: start.x + (end.x - start.x) * progress,
  y: start.y + (end.y - start.y) * progress
});

export const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

export const easeInCubic = (t: number): number => t * t * t;

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export const linear = (t: number): number => t;
