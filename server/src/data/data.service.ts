import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface SavedFormula {
  id: string;
  name: string;
  expression: string;
  createdAt: number;
}

export interface AppSettings {
  precision: number;
  angleMode: 'deg' | 'rad';
  darkMode: boolean;
}

export interface AppData {
  history: CalculationHistory[];
  formulas: SavedFormula[];
  settings: AppSettings;
}

@Injectable()
export class DataService implements OnModuleInit {
  private readonly dataFilePath: string;
  private data: AppData = {
    history: [],
    formulas: [],
    settings: {
      precision: 10,
      angleMode: 'deg',
      darkMode: false,
    },
  };

  constructor() {
    this.dataFilePath = path.join(__dirname, '..', 'data.json');
  }

  onModuleInit() {
    this.loadData();
  }

  private loadData() {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const rawData = fs.readFileSync(this.dataFilePath, 'utf-8');
        this.data = JSON.parse(rawData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      this.saveData();
    }
  }

  private saveData() {
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  getHistory(): CalculationHistory[] {
    return [...this.data.history];
  }

  addHistory(item: Omit<CalculationHistory, 'id' | 'timestamp'>): CalculationHistory {
    const newItem: CalculationHistory = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    this.data.history.unshift(newItem);
    if (this.data.history.length > 100) {
      this.data.history = this.data.history.slice(0, 100);
    }
    this.saveData();
    return newItem;
  }

  clearHistory() {
    this.data.history = [];
    this.saveData();
  }

  deleteHistoryItem(id: string): boolean {
    const index = this.data.history.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data.history.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  getFormulas(): SavedFormula[] {
    return [...this.data.formulas];
  }

  addFormula(item: Omit<SavedFormula, 'id' | 'createdAt'>): SavedFormula {
    const newFormula: SavedFormula = {
      ...item,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    this.data.formulas.push(newFormula);
    this.saveData();
    return newFormula;
  }

  deleteFormula(id: string): boolean {
    const index = this.data.formulas.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data.formulas.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  getSettings(): AppSettings {
    return { ...this.data.settings };
  }

  updateSettings(partial: Partial<AppSettings>): AppSettings {
    this.data.settings = {
      ...this.data.settings,
      ...partial,
    };
    this.saveData();
    return this.getSettings();
  }
}
