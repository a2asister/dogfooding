import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { dbQueries, parseProduct, Product } from '../db';

export default async function productRoutes(fastify: FastifyInstance) {
  fastify.get('/api/products', async () => {
    const rows = dbQueries.getAll.all();
    return rows.map(parseProduct);
  });

  fastify.get('/api/products/category/:category', async (request) => {
    const { category } = request.params as { category: string };
    const rows = dbQueries.getByCategory.all(decodeURIComponent(category));
    return rows.map(parseProduct);
  });

  fastify.get('/api/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const row = dbQueries.getById.get(id);
    if (!row) {
      reply.status(404).send({ message: 'Product not found' });
      return;
    }
    return parseProduct(row);
  });

  fastify.post('/api/products', async (request) => {
    const body = request.body as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
    const id = uuidv4();
    const now = new Date().toISOString();
    dbQueries.create.run(
      id,
      body.name,
      body.category,
      body.image,
      JSON.stringify(body.properties),
      now,
      now
    );
    const row = dbQueries.getById.get(id);
    return parseProduct(row);
  });

  fastify.put('/api/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
    const existing = dbQueries.getById.get(id);
    if (!existing) {
      reply.status(404).send({ message: 'Product not found' });
      return;
    }
    const now = new Date().toISOString();
    dbQueries.update.run(
      body.name,
      body.category,
      body.image,
      JSON.stringify(body.properties),
      now,
      id
    );
    const row = dbQueries.getById.get(id);
    return parseProduct(row);
  });

  fastify.delete('/api/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = dbQueries.getById.get(id);
    if (!existing) {
      reply.status(404).send({ message: 'Product not found' });
      return;
    }
    dbQueries.delete.run(id);
    return { message: 'Product deleted successfully' };
  });
}
