"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStorageService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');
let DataStorageService = class DataStorageService {
    constructor() {
        this.ensureDataDirectoryExists();
        this.dataStore = this.loadData();
    }
    onModuleInit() {
        this.initializeDefaultData();
    }
    ensureDataDirectoryExists() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
    }
    loadData() {
        if (fs.existsSync(DATA_FILE)) {
            try {
                const data = fs.readFileSync(DATA_FILE, 'utf-8');
                return JSON.parse(data);
            }
            catch (error) {
                console.error('Error loading data file:', error);
                return this.getDefaultData();
            }
        }
        return this.getDefaultData();
    }
    saveData() {
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.dataStore, null, 2), 'utf-8');
        }
        catch (error) {
            console.error('Error saving data file:', error);
        }
    }
    getDefaultData() {
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
    initializeDefaultData() {
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
    getRobots() {
        return [...this.dataStore.robots];
    }
    getRobotById(id) {
        return this.dataStore.robots.find(robot => robot.id === id);
    }
    createRobot(robot) {
        const newRobot = {
            ...robot,
            id: `robot-${Date.now()}`,
            lastUpdate: new Date().toISOString(),
        };
        this.dataStore.robots.push(newRobot);
        this.saveData();
        return newRobot;
    }
    updateRobot(id, updates) {
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
    deleteRobot(id) {
        const index = this.dataStore.robots.findIndex(robot => robot.id === id);
        if (index !== -1) {
            this.dataStore.robots.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }
    getTasks() {
        return [...this.dataStore.tasks];
    }
    getTaskById(id) {
        return this.dataStore.tasks.find(task => task.id === id);
    }
    createTask(task) {
        const newTask = {
            ...task,
            id: `task-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.dataStore.tasks.push(newTask);
        this.saveData();
        return newTask;
    }
    updateTask(id, updates) {
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
    deleteTask(id) {
        const index = this.dataStore.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
            this.dataStore.tasks.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }
    getMapGrid() {
        return { ...this.dataStore.mapGrid };
    }
    updateMapGrid(grid) {
        this.dataStore.mapGrid = { ...grid };
        this.saveData();
        return this.dataStore.mapGrid;
    }
    getObstacles() {
        return [...this.dataStore.obstacles];
    }
    addObstacle(obstacle) {
        const newObstacle = {
            ...obstacle,
            id: `obs-${Date.now()}`,
        };
        this.dataStore.obstacles.push(newObstacle);
        this.saveData();
        return newObstacle;
    }
    removeObstacle(id) {
        const index = this.dataStore.obstacles.findIndex(obs => obs.id === id);
        if (index !== -1) {
            this.dataStore.obstacles.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }
};
exports.DataStorageService = DataStorageService;
exports.DataStorageService = DataStorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DataStorageService);
//# sourceMappingURL=data-storage.service.js.map