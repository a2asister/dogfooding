import fastify from 'fastify';
import cors from '@fastify/cors';
import { executeCommand, getCurrentPath } from './commands';
import './db';

const server = fastify({ logger: true });

void server.register(cors, {
  origin: 'http://localhost:3945',
});

interface ExecuteBody {
  command: string;
}

server.post<{ Body: ExecuteBody }>('/api/execute', async (request, reply) => {
  const { command } = request.body;
  
  if (typeof command !== 'string') {
    return reply.status(400).send({ error: 'Invalid command' });
  }

  const result = executeCommand(command);
  return {
    output: result.output,
    path: result.path,
    clear: result.clear,
  };
});

server.get('/api/path', () => {
  return { path: getCurrentPath() };
});

const start = async () => {
  try {
    await server.listen({ port: 3946, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3946');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

void start();
