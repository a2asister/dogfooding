import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Plant, CareRecord } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const PLANTS_FILE = path.join(DATA_DIR, 'plants.json');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');

export class DataStore {
  private static instance: DataStore;
  private plants: Plant[] = [];
  private records: CareRecord[] = [];
  private initialized = false;

  private constructor() {}

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  public async init(): Promise<void> {
    if (this.initialized) return;

    try {
      if (!existsSync(DATA_DIR)) {
        await mkdir(DATA_DIR, { recursive: true });
      }

      if (existsSync(PLANTS_FILE)) {
        const content = await readFile(PLANTS_FILE, 'utf-8');
        this.plants = JSON.parse(content);
      } else {
        this.plants = [];
        await this.savePlants();
      }

      if (existsSync(RECORDS_FILE)) {
        const content = await readFile(RECORDS_FILE, 'utf-8');
        this.records = JSON.parse(content);
      } else {
        this.records = [];
        await this.saveRecords();
      }

      this.initialized = true;
    } catch (error) {
      console.error('数据存储初始化失败:', error);
      throw error;
    }
  }

  private async savePlants(): Promise<void> {
    await writeFile(PLANTS_FILE, JSON.stringify(this.plants, null, 2), 'utf-8');
  }

  private async saveRecords(): Promise<void> {
    await writeFile(RECORDS_FILE, JSON.stringify(this.records, null, 2), 'utf-8');
  }

  public getPlants(): Plant[] {
    return [...this.plants];
  }

  public getPlantById(id: string): Plant | undefined {
    return this.plants.find(p => p.id === id);
  }

  public async addPlant(plant: Plant): Promise<Plant> {
    this.plants.push(plant);
    await this.savePlants();
    return plant;
  }

  public async updatePlant(id: string, updates: Partial<Plant>): Promise<Plant | undefined> {
    const index = this.plants.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    this.plants[index] = {
      ...this.plants[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    await this.savePlants();
    return this.plants[index];
  }

  public async deletePlant(id: string): Promise<boolean> {
    const index = this.plants.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.plants.splice(index, 1);
    this.records = this.records.filter(r => r.plantId !== id);
    await this.savePlants();
    await this.saveRecords();
    return true;
  }

  public getRecords(): CareRecord[] {
    return [...this.records];
  }

  public getRecordsByPlantId(plantId: string): CareRecord[] {
    return this.records
      .filter(r => r.plantId === plantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async addRecord(record: CareRecord): Promise<CareRecord> {
    this.records.push(record);
    await this.saveRecords();

    if (record.type !== 'photo') {
      const plant = this.getPlantById(record.plantId);
      if (plant) {
        const latestCareTime = { ...plant.latestCareTime, [record.type]: record.createdAt };
        await this.updatePlant(plant.id, { latestCareTime });
      }
    }

    return record;
  }

  public async deleteRecord(id: string): Promise<boolean> {
    const index = this.records.findIndex(r => r.id === id);
    if (index === -1) return false;

    this.records.splice(index, 1);
    await this.saveRecords();
    return true;
  }
}

export const dataStore = DataStore.getInstance();