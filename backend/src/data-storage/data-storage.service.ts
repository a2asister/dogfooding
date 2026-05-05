import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Robot } from '../robots/interfaces/robot.interface';
import { Task } from '../tasks/interfaces/task.interface';
import { MapGrid } from '../path-planning/interfaces/path-planning.interface';
import { Obstacle } from '../obstacle-avoidance/interfaces/obstacle.interface';

interface DataStore {
  robots: Robot[];
  tasks: Task[];
  mapGrid: MapGrid;
  obstacles: Obstacle[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');

@Injectable()
export class DataStorageService implements OnModuleInit {
  private dataStore: DataStore;

  constructor() {
    this.ensureDataDirectoryExists();
    this.dataStore = this.loadData();
  }

  onModuleInit() {
    this.initializeDefaultData();
  }

  private ensureDataDirectoryExists(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DataStore {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
      } catch (error) {
        console.error('Error loading data file:', error);
        return this.getDefaultData();
      }
    }
    return this.getDefaultData();
  }

  private saveData(): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.dataStore, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving data file:', error);
    }
  }

  private getDefaultData(): DataStore {
    return {
      robots: [],
      tasks: [],
      mapGrid: {
        width: 20,
        height: 20,
        grid: Array(20).fill(null).map(() => Array(20).fill(0)),
      },
      obstacles: [],
    };
  }

  private initializeDefaultData(): void {
    if (this.dataStore.robots.length === 0) {
      this.dataStore.robots = [
        {
          id: 'robot-001',
          name: 'Robot A',
          status: 'idle',
          position: { x: 1, y: 1 },
          batteryLevel: 100,
          speed: 1.0,
          lastUpdate: new Date().toISOString(),
        },
        {
          id: 'robot-002',
          name: 'Robot B',
          status: 'idle',
          position: { x: 5, y: 5 },
          batteryLevel: 85,
          speed: 1.2,
          lastUpdate: new Date().toISOString(),
        },
        {
          id: 'robot-003',
          name: 'Robot C',
          status: 'idle',
          position: { x: 10, y: 10 },
          batteryLevel: 95,
          speed: 0.8,
          lastUpdate: new Date().toISOString(),
        },
      ];
      
      this.dataStore.obstacles = [
        { id: 'obs-001', position: { x: 3, y: 3 }, type: 'static', size: 1 },
        { id: 'obs-002', position: { x: 7, y: 4 }, type: 'static', size: 1 },
        { id: 'obs-003', position: { x: 12, y: 8 }, type: 'static', size: 1 },
      ];
      
      this.saveData();
    }
  }

  getRobots(): Robot[] {
    return [...this.dataStore.robots];
  }

  getRobotById(id: string): Robot | undefined {
    return this.dataStore.robots.find(robot => robot.id === id);
  }

  createRobot(robot: Omit<Robot, 'id' | 'lastUpdate'>): Robot {
    const newRobot: Robot = {
      ...robot,
      id: `robot-${Date.now()}`,
      lastUpdate: new Date().toISOString(),
    };
    this.dataStore.robots.push(newRobot);
    this.saveData();
    return newRobot;
  }

  updateRobot(id: string, updates: Partial<Robot>): Robot | undefined {
    const index = this.dataStore.robots.findIndex(robot => robot.id === id);
    if (index !== -1) {
      this.dataStore.robots[index] = {
        ...this.dataStore.robots[index],
        ...updates,
        lastUpdate: new Date().toISOString(),
      };
      this.saveData();
      return this.dataStore.robots[index];
    }
    return undefined;
  }

  deleteRobot(id: string): boolean {
    const index = this.dataStore.robots.findIndex(robot => robot.id === id);
    if (index !== -1) {
      this.dataStore.robots.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  getTasks(): Task[] {
    return [...this.dataStore.tasks];
  }

  getTaskById(id: string): Task | undefined {
    return this.dataStore.tasks.find(task => task.id === id);
  }

  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.dataStore.tasks.push(newTask);
    this.saveData();
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const index = this.dataStore.tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      this.dataStore.tasks[index] = {
        ...this.dataStore.tasks[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveData();
      return this.dataStore.tasks[index];
    }
    return undefined;
  }

  deleteTask(id: string): boolean {
    const index = this.dataStore.tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      this.dataStore.tasks.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  getMapGrid(): MapGrid {
    return { ...this.dataStore.mapGrid };
  }

  updateMapGrid(grid: MapGrid): MapGrid {
    this.dataStore.mapGrid = { ...grid };
    this.saveData();
    return this.dataStore.mapGrid;
  }

  getObstacles(): Obstacle[] {
    return [...this.dataStore.obstacles];
  }

  addObstacle(obstacle: Omit<Obstacle, 'id'>): Obstacle {
    const newObstacle: Obstacle = {
      ...obstacle,
      id: `obs-${Date.now()}`,
    };
    this.dataStore.obstacles.push(newObstacle);
    this.saveData();
    return newObstacle;
  }

  removeObstacle(id: string): boolean {
    const index = this.dataStore.obstacles.findIndex(obs => obs.id === id);
    if (index !== -1) {
      this.dataStore.obstacles.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }
}
