import { Injectable } from '@nestjs/common';
import { evaluate, parse } from 'mathjs';

@Injectable()
export class FormulaParserService {
  validateFormula(formula: string): boolean {
    try {
      parse(formula);
      return true;
    } catch {
      return false;
    }
  }

  calculateValue(formula: string, x: number, params: Record<string, number> = {}): number {
    try {
      const scope = { x, ...params };
      const result = evaluate(formula, scope);
      return typeof result === 'number' ? result : NaN;
    } catch {
      return NaN;
    }
  }

  generateSeries(
    formula: string,
    start: number,
    end: number,
    step: number,
    params: Record<string, number> = {},
  ): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    for (let x = start; x <= end; x += step) {
      const y = this.calculateValue(formula, x, params);
      if (!isNaN(y) && isFinite(y)) {
        points.push({ x, y });
      }
    }
    return points;
  }
}
