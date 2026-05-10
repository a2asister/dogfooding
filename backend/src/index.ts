import fastify from 'fastify';
import cors from '@fastify/cors';
import productRoutes from './routes/products';

const server = fastify({ logger: true });

await server.register(cors, {
  origin: 'http://localhost:3000',
  credentials: true
});

server.register(productRoutes);

const start = async () => {
  try {
    await server.listen({ port: 4000, host: '0.0.0.0' });
    console.log('🚀 Server running on http://localhost:4000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
