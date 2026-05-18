import type { Express, Request, Response } from 'express';
import {
  getExperimentsBySimulationId,
  createExperiment,
  getSimulationById,
  type DatabaseType,
} from '../db';

export function setupExperimentRoutes(app: Express, db: DatabaseType): void {
  app.get('/api/simulations/:id/experiments', (req: Request, res: Response): void => {
    try {
      const simulationId = Number(req.params['id']);
      if (Number.isNaN(simulationId)) {
        res.status(400).json({ success: false, error: 'Invalid simulation ID' });
        return;
      }

      const simulation = getSimulationById(db, simulationId);
      if (simulation === null) {
        res.status(404).json({ success: false, error: 'Simulation not found' });
        return;
      }

      const experiments = getExperimentsBySimulationId(db, simulationId);
      res.json({ success: true, data: experiments });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: message });
    }
  });

  app.post('/api/simulations/:id/experiments', (req: Request, res: Response): void => {
    try {
      const simulationId = Number(req.params['id']);
      if (Number.isNaN(simulationId)) {
        res.status(400).json({ success: false, error: 'Invalid simulation ID' });
        return;
      }

      const simulation = getSimulationById(db, simulationId);
      if (simulation === null) {
        res.status(404).json({ success: false, error: 'Simulation not found' });
        return;
      }

      const { name, parameters, result } = req.body as {
        name: unknown;
        parameters: unknown;
        result: unknown;
      };

      if (
        typeof name !== 'string' ||
        typeof parameters !== 'string' ||
        typeof result !== 'string'
      ) {
        res.status(400).json({ success: false, error: 'Invalid request body' });
        return;
      }

      const id = createExperiment(db, simulationId, name, parameters, result);
      const experiments = getExperimentsBySimulationId(db, simulationId);
      const createdExperiment = experiments.find((exp) => exp.id === id) ?? null;

      res.status(201).json({ success: true, data: createdExperiment });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: message });
    }
  });
}
