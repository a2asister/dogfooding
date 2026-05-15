import fastify from 'fastify';
import cors from '@fastify/cors';
import { executeCommand, getCurrentPath, getCompletions } from './commands';
import { getConfig, getAllAliases, getCommandHistory } from './db';
import { fs } from './filesystem';

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

server.get('/api/config', () => {
  return {
    theme: getConfig('theme', 'dark'),
    prompt: getConfig('prompt', '%user@%host:%path$ '),
  };
});

server.get('/api/aliases', () => {
  const aliases = getAllAliases();
  return Object.fromEntries(aliases);
});

server.get('/api/history', () => {
  const history = getCommandHistory(100);
  return { history };
});

interface FileBody {
  filename: string;
  content?: string;
}

server.post<{ Body: FileBody }>('/api/file/read', async (request, reply) => {
  const { filename } = request.body;
  
  if (!fs.exists(filename)) {
    return reply.status(404).send({ error: 'File not found' });
  }
  
  if (fs.getType(filename) !== 'file') {
    return reply.status(400).send({ error: 'Not a file' });
  }
  
  const content = fs.readFile(filename);
  return { content };
});

server.post<{ Body: FileBody }>('/api/file/write', async (request, reply) => {
  const { filename, content } = request.body;
  
  const success = fs.writeFile(filename, content || '');
  if (!success) {
    return reply.status(500).send({ error: 'Failed to write file' });
  }
  
  return { success: true };
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
