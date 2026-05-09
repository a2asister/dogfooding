import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CalculatorService {
  private precision = 10;
  private angleMode: 'deg' | 'rad' = 'deg';

  setPrecision(value: number) {
    this.precision = value;
  }

  setAngleMode(mode: 'deg' | 'rad') {
    this.angleMode = mode;
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  private round(value: number): number {
    const factor = Math.pow(10, this.precision);
    return Math.round(value * factor) / factor;
  }

  private evaluateBasic(expr: string): number {
    const safeExpr = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/\^/g, '**');
    
    if (/[^0-9+\-*/.()\s%]/.test(safeExpr)) {
      throw new Error('Invalid expression');
    }

    let result = Function('"use strict"; return (' + safeExpr + ')')();

    if (!isFinite(result)) {
      throw new Error('Invalid calculation');
    }

    return result;
  }

  private replaceFunctions(expr: string): string {
    let processed = expr;

    processed = processed.replace(/sin\(/g, 'this._sin(');
    processed = processed.replace(/cos\(/g, 'this._cos(');
    processed = processed.replace(/tan\(/g, 'this._tan(');
    processed = processed.replace(/asin\(/g, 'this._asin(');
    processed = processed.replace(/acos\(/g, 'this._acos(');
    processed = processed.replace(/atan\(/g, 'this._atan(');
    processed = processed.replace(/log\(/g, 'Math.log10(');
    processed = processed.replace(/ln\(/g, 'Math.log(');
    processed = processed.replace(/sqrt\(/g, 'Math.sqrt(');
    processed = processed.replace(/\^/g, '**');
    processed = processed.replace(/π/g, 'Math.PI');
    processed = processed.replace(/e/g, 'Math.E');

    return processed;
  }

  private _sin(x: number): number {
    return this.angleMode === 'deg' ? Math.sin(this.toRadians(x)) : Math.sin(x);
  }

  private _cos(x: number): number {
    return this.angleMode === 'deg' ? Math.cos(this.toRadians(x)) : Math.cos(x);
  }

  private _tan(x: number): number {
    return this.angleMode === 'deg' ? Math.tan(this.toRadians(x)) : Math.tan(x);
  }

  private _asin(x: number): number {
    const result = Math.asin(x);
    return this.angleMode === 'deg' ? this.toDegrees(result) : result;
  }

  private _acos(x: number): number {
    const result = Math.acos(x);
    return this.angleMode === 'deg' ? this.toDegrees(result) : result;
  }

  private _atan(x: number): number {
    const result = Math.atan(x);
    return this.angleMode === 'deg' ? this.toDegrees(result) : result;
  }

  calculate(expression: string): string {
    try {
      if (!expression || expression.trim() === '') {
        return '0';
      }

      let expr = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');

      const scope = {
        _sin: (x: number) => this._sin(x),
        _cos: (x: number) => this._cos(x),
        _tan: (x: number) => this._tan(x),
        _asin: (x: number) => this._asin(x),
        _acos: (x: number) => this._acos(x),
        _atan: (x: number) => this._atan(x),
      };

      expr = this.replaceFunctions(expr);

      let result: number;

      const safePattern = /^(?:\d+\.?\d*|\.\d+|[+\-*/().\s]|Math\.(PI|E|log|log10|sqrt|abs|floor|ceil|round|sin|cos|tan|asin|acos|atan|pow|exp)|this\._(sin|cos|tan|asin|acos|atan)\()*$/;
      
      if (!expr.includes('this._') && !expr.includes('Math.')) {
        result = this.evaluateBasic(expr);
      } else {
        const fn = new Function(
          'scope',
          `with(scope) { "use strict"; return (${expr}); }`
        );
        result = fn(scope);
      }

      if (!isFinite(result) || isNaN(result)) {
        return 'Error';
      }

      const rounded = this.round(result);
      
      if (Number.isInteger(rounded)) {
        return rounded.toString();
      }

      let str = rounded.toFixed(this.precision);
      str = str.replace(/\.?0+$/, '');

      return str;
    } catch (e) {
      return 'Error';
    }
  }

  percentage(value: string): string {
    try {
      const num = parseFloat(value);
      if (isNaN(num)) return 'Error';
      return this.round(num / 100).toString();
    } catch {
      return 'Error';
    }
  }

  factorial(value: string): string {
    try {
      let num = parseInt(value, 10);
      if (isNaN(num) || num < 0) return 'Error';
      if (num === 0 || num === 1) return '1';
      let result = 1;
      for (let i = 2; i <= num; i++) {
        result *= i;
      }
      return result.toString();
    } catch {
      return 'Error';
    }
  }

  square(value: string): string {
    try {
      const num = parseFloat(value);
      if (isNaN(num)) return 'Error';
      return this.round(num * num).toString();
    } catch {
      return 'Error';
    }
  }

  cube(value: string): string {
    try {
      const num = parseFloat(value);
      if (isNaN(num)) return 'Error';
      return this.round(num * num * num).toString();
    } catch {
      return 'Error';
    }
  }

  squareRoot(value: string): string {
    try {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) return 'Error';
      return this.round(Math.sqrt(num)).toString();
    } catch {
      return 'Error';
    }
  }

  reciprocal(value: string): string {
    try {
      const num = parseFloat(value);
      if (isNaN(num) || num === 0) return 'Error';
      return this.round(1 / num).toString();
    } catch {
      return 'Error';
    }
  }
}
