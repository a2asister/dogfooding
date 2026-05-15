import { FastifyInstance } from 'fastify';
import { db } from './database';
import { validateConfig, validateBulkImport } from './validation';
import { ButtonAnimationConfig } from './types';

export async function routes(fastify: FastifyInstance) {
  fastify.get('/api/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  fastify.get('/api/templates', async () => {
    return db.getAllTemplates();
  });

  fastify.get('/api/templates/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const template = db.getTemplateById(id);
    if (!template) {
      return reply.status(404).send({ error: 'Template not found' });
    }
    return template;
  });

  fastify.post('/api/templates', async (request, reply) => {
    const validation = validateConfig(request.body);
    if (!validation.success) {
      return reply.status(400).send({
        error: 'Invalid configuration',
        details: validation.error.issues
      });
    }
    const config = validation.data as ButtonAnimationConfig;
    return db.createTemplate(config);
  });

  fastify.put('/api/templates/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const validation = validateConfig(request.body);
    if (!validation.success) {
      return reply.status(400).send({
        error: 'Invalid configuration',
        details: validation.error.issues
      });
    }
    const config = validation.data as ButtonAnimationConfig;
    const updated = db.updateTemplate(id, config);
    if (!updated) {
      return reply.status(404).send({ error: 'Template not found' });
    }
    return updated;
  });

  fastify.delete('/api/templates/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = db.deleteTemplate(id);
    if (!deleted) {
      return reply.status(404).send({ error: 'Template not found' });
    }
    return { success: true, message: 'Template deleted' };
  });

  fastify.post('/api/templates/bulk-import', async (request, reply) => {
    const validation = validateBulkImport(request.body);
    if (!validation.success) {
      return reply.status(400).send({
        error: 'Invalid bulk import data',
        details: validation.error.issues
      });
    }
    const templates = validation.data as ButtonAnimationConfig[];
    return db.bulkImport(templates);
  });

  fastify.get('/api/templates/export/all', async () => {
    const templates = db.getAllTemplates();
    return {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      count: templates.length,
      templates
    };
  });
}
