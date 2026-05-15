import fastify from 'fastify';
import cors from '@fastify/cors';
import { executeCommand, getCurrentPath, getCompletions } from './commands';
import './db';

const server = fastify({ logger: true });

void server.register(cors, {
  origin: true,
});

interface ExecuteBody {
  command: string;
}

interface CompletionBody {
  partial: string;
  path: string;
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

server.post<{ Body: CompletionBody }>('/api/completions', async (request, reply) => {
  const { partial, path } = request.body;
  
  if (typeof partial !== 'string' || typeof path !== 'string') {
    return reply.status(400).send({ error: 'Invalid parameters' });
  }

  const completions = getCompletions(partial, path);
  return { completions };
});

server.get('/api/path', () => {
  return { path: getCurrentPath() };
});

const start = async () => {
  try {
    await server.listen({ port: 3950, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3950');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

void start();
