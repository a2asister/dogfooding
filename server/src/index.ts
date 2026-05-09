import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from './dataStore.js';
import { Plant, CareRecord, CareType, MonthlyStats } from './types.js';

const app = express();
const PORT = 3456;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

async function main() {
  await dataStore.init();

  app.get('/api/plants', (req, res) => {
    const plants = dataStore.getPlants();
    res.json(plants);
  });

  app.get('/api/plants/:id', (req, res) => {
    const plant = dataStore.getPlantById(req.params.id);
    if (!plant) {
      return res.status(404).json({ error: '绿植不存在' });
    }
    res.json(plant);
  });

  app.post('/api/plants', async (req, res) => {
    const now = new Date().toISOString();
    const plant: Plant = {
      id: uuidv4(),
      name: req.body.name,
      species: req.body.species || '',
      note: req.body.note,
      avatarUrl: req.body.avatarUrl,
      careSchedule: {
        watering: { days: req.body.wateringDays || 3, enabled: true },
        fertilizing: { days: req.body.fertilizingDays || 14, enabled: req.body.fertilizingEnabled ?? false },
        pruning: { days: req.body.pruningDays || 30, enabled: req.body.pruningEnabled ?? false }
      },
      createdAt: now,
      updatedAt: now
    };

    const created = await dataStore.addPlant(plant);
    res.status(201).json(created);
  });

  app.put('/api/plants/:id', async (req, res) => {
    const updates: Partial<Plant> = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.species !== undefined) updates.species = req.body.species;
    if (req.body.note !== undefined) updates.note = req.body.note;
    if (req.body.avatarUrl !== undefined) updates.avatarUrl = req.body.avatarUrl;
    
    const plant = dataStore.getPlantById(req.params.id);
    if (!plant) {
      return res.status(404).json({ error: '绿植不存在' });
    }

    if (req.body.wateringDays !== undefined || req.body.fertilizingDays !== undefined || 
        req.body.fertilizingEnabled !== undefined || req.body.pruningDays !== undefined || 
        req.body.pruningEnabled !== undefined) {
      updates.careSchedule = {
        watering: { 
          days: req.body.wateringDays ?? plant.careSchedule.watering.days, 
          enabled: true 
        },
        fertilizing: { 
          days: req.body.fertilizingDays ?? plant.careSchedule.fertilizing.days, 
          enabled: req.body.fertilizingEnabled ?? plant.careSchedule.fertilizing.enabled 
        },
        pruning: { 
          days: req.body.pruningDays ?? plant.careSchedule.pruning.days, 
          enabled: req.body.pruningEnabled ?? plant.careSchedule.pruning.enabled 
        }
      };
    }

    const updated = await dataStore.updatePlant(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: '绿植不存在' });
    }
    res.json(updated);
  });

  app.delete('/api/plants/:id', async (req, res) => {
    const success = await dataStore.deletePlant(req.params.id);
    if (!success) {
      return res.status(404).json({ error: '绿植不存在' });
    }
    res.status(204).send();
  });

  app.get('/api/plants/:id/records', (req, res) => {
    const plant = dataStore.getPlantById(req.params.id);
    if (!plant) {
      return res.status(404).json({ error: '绿植不存在' });
    }
    const records = dataStore.getRecordsByPlantId(req.params.id);
    res.json(records);
  });

  app.post('/api/records', async (req, res) => {
    const plant = dataStore.getPlantById(req.body.plantId);
    if (!plant) {
      return res.status(404).json({ error: '绿植不存在' });
    }

    const record: CareRecord = {
      id: uuidv4(),
      plantId: req.body.plantId,
      type: req.body.type as CareType,
      note: req.body.note,
      photoUrl: req.body.photoUrl,
      createdAt: new Date().toISOString()
    };

    const created = await dataStore.addRecord(record);
    res.status(201).json(created);
  });

  app.delete('/api/records/:id', async (req, res) => {
    const success = await dataStore.deleteRecord(req.params.id);
    if (!success) {
      return res.status(404).json({ error: '记录不存在' });
    }
    res.status(204).send();
  });

  app.get('/api/stats/monthly', (req, res) => {
    const month = req.query.month as string || new Date().toISOString().slice(0, 7);
    const yearMonth = month.slice(0, 7);
    
    const records = dataStore.getRecords().filter(r => 
      r.createdAt.startsWith(yearMonth)
    );

    const byType: Record<CareType, number> = {
      watering: 0,
      fertilizing: 0,
      pruning: 0,
      photo: 0
    };

    records.forEach(r => {
      byType[r.type]++;
    });

    const plants = dataStore.getPlants();
    let totalTasks = 0;
    
    const [year, m] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, m, 0).getDate();

    plants.forEach(plant => {
      if (plant.careSchedule.watering.enabled) {
        totalTasks += Math.ceil(daysInMonth / plant.careSchedule.watering.days);
      }
      if (plant.careSchedule.fertilizing.enabled) {
        totalTasks += Math.ceil(daysInMonth / plant.careSchedule.fertilizing.days);
      }
      if (plant.careSchedule.pruning.enabled) {
        totalTasks += Math.ceil(daysInMonth / plant.careSchedule.pruning.days);
      }
    });

    const completedTasks = records.filter(r => r.type !== 'photo').length;
    const stats: MonthlyStats = {
      month: yearMonth,
      totalTasks: Math.max(totalTasks, completedTasks),
      completedTasks,
      completionRate: totalTasks > 0 ? Math.min(100, Math.round((completedTasks / totalTasks) * 100)) : 100,
      byType,
      records
    };

    res.json(stats);
  });

  app.get('/api/plants/:id/next-care', (req, res) => {
    const plant = dataStore.getPlantById(req.params.id);
    if (!plant) {
      return res.status(404).json({ error: '绿植不存在' });
    }

    const now = Date.now();
    const nextCare = {
      watering: plant.careSchedule.watering.enabled ? (
        plant.latestCareTime?.watering 
          ? new Date(new Date(plant.latestCareTime.watering).getTime() + plant.careSchedule.watering.days * 24 * 60 * 60 * 1000).toISOString()
          : new Date(now).toISOString()
      ) : null,
      fertilizing: plant.careSchedule.fertilizing.enabled ? (
        plant.latestCareTime?.fertilizing
          ? new Date(new Date(plant.latestCareTime.fertilizing).getTime() + plant.careSchedule.fertilizing.days * 24 * 60 * 60 * 1000).toISOString()
          : new Date(now).toISOString()
      ) : null,
      pruning: plant.careSchedule.pruning.enabled ? (
        plant.latestCareTime?.pruning
          ? new Date(new Date(plant.latestCareTime.pruning).getTime() + plant.careSchedule.pruning.days * 24 * 60 * 60 * 1000).toISOString()
          : new Date(now).toISOString()
      ) : null
    };

    res.json(nextCare);
  });

  app.listen(PORT, () => {
    console.log(`🌱 绿植养护服务已启动: http://localhost:${PORT}`);
    console.log(`📁 数据存储在: server/data/`);
  });
}

main().catch(err => {
  console.error('服务启动失败:', err);
  process.exit(1);
});