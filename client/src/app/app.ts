import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculatorService } from './calculator.service';
import {
  ApiService,
  type CalculationHistory,
  type SavedFormula,
  type AppSettings,
} from './api.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit {
  private readonly calculatorService = inject(CalculatorService);
  private readonly apiService = inject(ApiService);

  display = '0';
  expression = '';
  history: CalculationHistory[] = [];
  formulas: SavedFormula[] = [];
  settings: AppSettings = {
    precision: 10,
    angleMode: 'deg',
    darkMode: false,
  };

  showHistory = false;
  showSettings = false;
  showSaveFormula = false;
  formulaName = '';
  activeTab: 'history' | 'formulas' = 'history';
  pressingKey: string | null = null;

  private lastResult = '';
  private lastExpression = '';
  private waitingForOperand = false;
  private justEvaluated = false;

  ngAfterViewInit() {
    this.loadData();
  }

  private loadData() {
    this.apiService.getSettings().subscribe({
      next: (settings) => {
        this.settings = settings;
        this.calculatorService.setPrecision(settings.precision);
        this.calculatorService.setAngleMode(settings.angleMode);
        this.updateTheme();
      },
    });

    this.apiService.getHistory().subscribe({
      next: (history) => {
        this.history = history;
      },
    });

    this.apiService.getFormulas().subscribe({
      next: (formulas) => {
        this.formulas = formulas;
      },
    });
  }

  updateTheme() {
    if (this.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(darkMode: boolean) {
    if (this.settings.darkMode !== darkMode) {
      this.settings.darkMode = darkMode;
      this.updateTheme();
      this.apiService.updateSettings({ darkMode: this.settings.darkMode }).subscribe();
    }
  }

  toggleDarkMode() {
    this.setTheme(!this.settings.darkMode);
  }

  toggleAngleMode() {
    this.settings.angleMode = this.settings.angleMode === 'deg' ? 'rad' : 'deg';
    this.calculatorService.setAngleMode(this.settings.angleMode);
    this.apiService
      .updateSettings({ angleMode: this.settings.angleMode })
      .subscribe();
  }

  setPrecision(value: number) {
    this.settings.precision = value;
    this.calculatorService.setPrecision(value);
    this.apiService.updateSettings({ precision: value }).subscribe();
    if (this.lastResult !== '') {
      this.display = this.calculatorService.calculate(this.lastResult);
    }
  }

  inputNumber(num: string) {
    this.animateKey(num);

    if (this.justEvaluated) {
      this.display = num;
      this.expression = '';
      this.justEvaluated = false;
      this.waitingForOperand = false;
      return;
    }

    if (this.waitingForOperand) {
      this.display = num;
      this.waitingForOperand = false;
    } else {
      if (this.display === '0') {
        this.display = num;
      } else {
        this.display += num;
      }
    }
  }

  inputDecimal() {
    this.animateKey('.');

    if (this.justEvaluated) {
      this.display = '0.';
      this.expression = '';
      this.justEvaluated = false;
      this.waitingForOperand = false;
      return;
    }

    if (this.waitingForOperand) {
      this.display = '0.';
      this.waitingForOperand = false;
      return;
    }

    if (!this.display.includes('.')) {
      this.display += '.';
    }
  }

  inputOperator(op: string) {
    this.animateKey(op);

    if (this.justEvaluated) {
      this.expression = `${this.lastResult} ${op} `;
      this.justEvaluated = false;
      this.waitingForOperand = true;
      return;
    }

    if (this.waitingForOperand) {
      this.expression = `${this.expression.slice(0, -3)} ${op} `;
      return;
    }

    if (this.expression === '') {
      this.expression = `${this.display} ${op} `;
    } else {
      this.expression += `${this.display} ${op} `;
    }

    this.waitingForOperand = true;
  }

  inputFunction(func: string) {
    this.animateKey(func);

    if (func === 'sin' || func === 'cos' || func === 'tan' || func === 'asin' || func === 'acos' || func === 'atan') {
      this.display = `${func}(`;
      this.justEvaluated = false;
      return;
    }

    if (func === 'log' || func === 'ln' || func === 'sqrt') {
      this.display = `${func}(`;
      this.justEvaluated = false;
      return;
    }

    if (func === 'x²') {
      this.display = this.calculatorService.square(this.display);
      return;
    }

    if (func === 'x³') {
      this.display = this.calculatorService.cube(this.display);
      return;
    }

    if (func === '1/x') {
      this.display = this.calculatorService.reciprocal(this.display);
      return;
    }

    if (func === 'n!') {
      this.display = this.calculatorService.factorial(this.display);
      return;
    }

    if (func === '%') {
      this.display = this.calculatorService.percentage(this.display);
      return;
    }

    if (func === 'π') {
      this.display = 'Math.PI';
      return;
    }

    if (func === 'e') {
      this.display = 'Math.E';
      return;
    }

    if (func === '±') {
      if (this.display.startsWith('-')) {
        this.display = this.display.slice(1);
      } else if (this.display !== '0') {
        this.display = '-' + this.display;
      }
      return;
    }

    if (func === '(' || func === ')') {
      if (this.display === '0') {
        this.display = func;
      } else {
        this.display += func;
      }
      return;
    }

    if (func === '^') {
      this.display += '^';
      return;
    }
  }

  clear() {
    this.animateKey('C');
    this.display = '0';
    this.expression = '';
    this.waitingForOperand = false;
    this.justEvaluated = false;
    this.lastResult = '';
  }

  clearEntry() {
    this.animateKey('CE');
    this.display = '0';
  }

  backspace() {
    if (this.display.length > 1) {
      this.display = this.display.slice(0, -1);
    } else {
      this.display = '0';
    }
  }

  calculate() {
    this.animateKey('=');

    try {
      let fullExpression: string;
      if (this.expression && this.waitingForOperand) {
        fullExpression = this.expression.slice(0, -3);
      } else if (this.expression) {
        fullExpression = this.expression + this.display;
      } else {
        fullExpression = this.display;
      }

      const result = this.calculatorService.calculate(fullExpression);

      this.lastResult = result;
      this.lastExpression = fullExpression;
      this.display = result;
      this.justEvaluated = true;
      this.waitingForOperand = false;

      if (result !== 'Error') {
        this.apiService.addHistory(fullExpression, result).subscribe({
          next: (item) => {
            this.history.unshift(item);
            if (this.history.length > 100) {
              this.history = this.history.slice(0, 100);
            }
          },
        });
      }

      this.expression = '';
    } catch {
      this.display = 'Error';
    }
  }

  private animateKey(key: string) {
    this.pressingKey = key;
    setTimeout(() => {
      this.pressingKey = null;
    }, 150);
  }

  recallHistory(item: CalculationHistory) {
    this.display = item.result;
    this.expression = item.expression + ' =';
    this.lastResult = item.result;
    this.justEvaluated = true;
  }

  recallFormula(formula: SavedFormula) {
    this.display = formula.expression;
    this.justEvaluated = false;
  }

  copyResult(result: string) {
    navigator.clipboard.writeText(result);
  }

  deleteHistoryItem(id: string) {
    this.apiService.deleteHistoryItem(id).subscribe({
      next: () => {
        this.history = this.history.filter((h) => h.id !== id);
      },
    });
  }

  deleteFormula(id: string) {
    this.apiService.deleteFormula(id).subscribe({
      next: () => {
        this.formulas = this.formulas.filter((f) => f.id !== id);
      },
    });
  }

  clearAllHistory() {
    this.apiService.clearHistory().subscribe({
      next: () => {
        this.history = [];
      },
    });
  }

  formulaError = '';

  openSaveFormula() {
    this.showSaveFormula = true;
    this.formulaName = '';
    this.formulaError = '';
  }

  saveCurrentFormula() {
    if (!this.formulaName.trim()) {
      this.formulaError = '请输入公式名称';
      return;
    }

    let currentExpr = this.display;
    if (this.justEvaluated && this.lastExpression) {
      currentExpr = this.lastExpression;
    }
    
    if (!currentExpr || currentExpr === '0' || currentExpr === 'Error') {
      this.formulaError = '没有可保存的公式内容';
      return;
    }

    this.apiService.addFormula(this.formulaName.trim(), currentExpr).subscribe({
      next: (formula) => {
        this.formulas.unshift(formula);
        this.showSaveFormula = false;
        this.formulaName = '';
        this.formulaError = '';
      },
      error: (err) => {
        this.formulaError = '保存失败，请重试';
        console.error('Save formula error:', err);
      },
    });
  }
}
