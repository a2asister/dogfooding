import type { Express, Request, Response } from 'express';
import {
  getAllSimulations,
  getSimulationById,
  createSimulation,
  updateSimulation,
  deleteSimulation,
  type DatabaseType,
} from '../db';

export function setupSimulationRoutes(app: Express, db: DatabaseType): void {
  app.get('/api/simulations', (_req: Request, res: Response): void => {
    try {
      const simulations = getAllSimulations(db);
      res.json({ success: true, data: simulations });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: message });
    }
  });

  app.get('/api/simulations/:id', (req: Request, res: Response): void => {
    try {
      const id = Number(req.params['id']);
      if (Number.isNaN(id)) {
        res.status(400).json({ success: false, error: 'Invalid simulation ID' });
        return;
      }

      const simulation = getSimulationById(db, id);
      simulation === null
        ? res.status(404).json({ success: false, error: 'Simulation not found' })
        : res.json({ success: true, data: simulation });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: message });
    }
  });

  app.post('/api/simulations', (req: Request, res: Response): void => {
    try {
      const { name, type, config } = req.body as {
        name: unknown;
        type: unknown;
        config: unknown;
      };

      if (
        typeof name !== 'string' ||
        typeof type !== 'string' ||
        typeof config !== 'string'
      ) {
        res.status(400).json({ success: false, error: 'Invalid request body' });
        return;
      }

      const id = createSimulation(db, name, type, config);
      const simulation = getSimulationById(db, id);
      res.status(201).json({ success: true, data: simulation });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: message });
    }
  });

  app.put('/api/simulations/:id', (req: Request, res: Response): void => {
    try {
      const id = Number(req.params['id']);
      if (Number.isNaN(id)) {
        res.status(400).json({ success: false, error: 'Invalid simulation ID' });
        return;
      }

      const { name, config } = req.body as { name: unknown; config: unknown };

      if (typeof name !== 'string' || typeof config !== 'string') {
        res.status(400).json({ success: false, error: 'Invalid request body' });
        return;
      }

      const success = updateSimulation(db, id, name, config);
      if (!success) {
        res.status(404).json({ success: false, error: 'Simulation not found' });
        return;
      }

      const simulation = getSimulationById(db, id);
      res.json({ success: true, data: simulation });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: message });
    }
  });

  app.delete('/api/simulations/:id', (req: Request, res: Response): void => {
    try {
      const id = Number(req.params['id']);
      if (Number.isNaN(id)) {
        res.status(400).json({ success: false, error: 'Invalid simulation ID' });
        return;
      }

      const success = deleteSimulation(db, id);
      success
        ? res.json({ success: true })
        : res.status(404).json({ success: false, error: 'Simulation not found' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: message });
    }
  });
}
