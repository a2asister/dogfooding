import Fastify from 'fastify';
import cors from '@fastify/cors';
import fs from 'fs';
import path from 'path';
import { routes } from './routes';

const PORT = parseInt(process.env.PORT || '38765');
const HOST = process.env.HOST || '0.0.0.0';

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const fastify = Fastify({
  logger: true
});

fastify.register(cors, {
  origin: ['http://localhost:23456', 'http://127.0.0.1:23456'],
  credentials: true
});

fastify.register(routes);

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
