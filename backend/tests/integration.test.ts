import tap from 'tap';
import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import db from '../src/db';
import { createUser, createTeam, addTeamMember, createShare } from '../src/db';
import { fs } from '../src/filesystem';
import { executeCommand } from '../src/index';

const server = fastify({ logger: false });

server.register(cors, {
  origin: true,
});

server.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
});

server.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

interface ExecuteBody {
  command: string;
  contextType?: 'user' | 'team';
  contextId?: number;
}

interface CompletionBody {
  partial: string;
  path: string;
  contextType?: 'user' | 'team';
  contextId?: number;
}

interface FileBody {
  filename: string;
  content?: string;
  contextType?: 'user' | 'team';
  contextId?: number;
}

interface ShareBody {
  nodeUuid: string;
  permission: 'read' | 'edit';
  expiresAt?: string;
  password?: string;
}

interface TeamBody {
  name: string;
  description?: string;
}

interface TeamMemberBody {
  userId: number;
  role: 'admin' | 'member' | 'guest';
}

interface PluginBody {
  name: string;
  description?: string;
  version: string;
  author?: string;
  code: string;
  commands?: string;
}

interface RegisterBody {
  email?: string;
  phone?: string;
  username?: string;
  password: string;
}

interface LoginBody {
  email?: string;
  phone?: string;
  username?: string;
  password: string;
}

function getContext(request: any): { type: string; id: number } | null {
  const body = request.body || {};
  const { contextType, contextId } = body as { contextType?: 'user' | 'team'; contextId?: number };
  const { userId } = request.user ? (request.user as { userId: number }) : { userId: null };

  if (contextType && contextId) {
    if (contextType === 'team') {
      const members = createTeam as any;
    }
    return { type: contextType, id: contextId };
  }

  if (userId) {
    return { type: 'user', id: userId };
  }

  return null;
}

server.post('/api/auth/register', async (request, reply) => {
  const { email, phone, username, password } = request.body as RegisterBody;

  if (!email && !phone && !username) {
    return reply.status(400).send({ error: 'Email, phone, or username is required' });
  }

  const userModule = await import('../src/db');
  if (email && userModule.getUserByEmail(email)) {
    return reply.status(400).send({ error: 'Email already registered' });
  }

  if (phone && userModule.getUserByPhone(phone)) {
    return reply.status(400).send({ error: 'Phone already registered' });
  }

  if (username && userModule.getUserByUsername(username)) {
    return reply.status(400).send({ error: 'Username already taken' });
  }

  const user = userModule.createUser({ email, phone, username, password });

  const token = server.jwt.sign({ userId: user.id, uuid: user.uuid });

  return {
    user: {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      phone: user.phone,
      username: user.username,
      theme: user.theme,
    },
    token,
  };
});

server.post('/api/auth/login', async (request, reply) => {
  const { email, phone, username, password } = request.body as LoginBody;

  let user: any | undefined;
  const userModule = await import('../src/db');
  if (email) {
    user = userModule.getUserByEmail(email);
  } else if (phone) {
    user = userModule.getUserByPhone(phone);
  } else if (username) {
    user = userModule.getUserByUsername(username);
  }

  if (!user) {
    return reply.status(401).send({ error: 'Invalid credentials' });
  }

  if (!userModule.verifyPassword(user, password)) {
    return reply.status(401).send({ error: 'Invalid credentials' });
  }

  const token = server.jwt.sign({ userId: user.id, uuid: user.uuid });

  return {
    user: {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      phone: user.phone,
      username: user.username,
      theme: user.theme,
    },
    token,
  };
});

server.get('/api/auth/me', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const userModule = await import('../src/db');
  const user = userModule.getUserById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    uuid: user.uuid,
    email: user.email,
    phone: user.phone,
    username: user.username,
    theme: user.theme,
    promptFormat: user.prompt_format,
  };
});

server.post('/api/execute', { onRequest: [server.authenticate] }, async (request, reply) => {
  const { command } = request.body as ExecuteBody;
  const { userId } = request.user as { userId: number };
  const context = { type: 'user', id: userId };

  if (typeof command !== 'string') {
    return reply.status(400).send({ error: 'Invalid command' });
  }

  const result = executeCommand(command, context);
  return {
    output: result.output,
    path: result.path,
    clear: result.clear,
  };
});

server.post('/api/completions', { onRequest: [server.authenticate] }, async (request, reply) => {
  const { partial, path } = request.body as CompletionBody;
  const { userId } = request.user as { userId: number };
  const context = { type: 'user', id: userId };

  if (typeof partial !== 'string' || typeof path !== 'string') {
    return reply.status(400).send({ error: 'Invalid parameters' });
  }

  const commandCompletions = Object.keys({
    pwd: true,
    ls: true,
    cd: true,
    mkdir: true,
    touch: true,
    cat: true,
    rm: true,
    mv: true,
    cp: true,
    echo: true,
    whoami: true,
    hostname: true,
    uname: true,
    date: true,
    grep: true,
    head: true,
    tail: true,
    wc: true,
    clear: true,
    theme: true,
    alias: true,
    prompt: true,
    history: true,
    help: true,
  }).filter(cmd => cmd.startsWith(partial));

  const fileCompletions = fs.listDirectory(context, path)
    .filter(item => item.name.startsWith(partial))
    .map(item => item.type === 'dir' ? `${item.name}/` : item.name);

  const completions = [...new Set([...commandCompletions, ...fileCompletions])];
  return { completions };
});

server.get('/api/path', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const context = { type: 'user', id: userId };
  return { path: fs.getCurrentPath(context) };
});

server.get('/api/config', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const userModule = await import('../src/db');
  return {
    theme: userModule.getConfig(userId, 'theme', 'dark'),
    prompt: userModule.getConfig(userId, 'prompt', '%user@%host:%path$ '),
  };
});

server.get('/api/aliases', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const userModule = await import('../src/db');
  const aliases = userModule.getAllAliases(userId);
  return Object.fromEntries(aliases);
});

server.get('/api/history', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const userModule = await import('../src/db');
  const history = userModule.getCommandHistory(userId);
  return { history };
});

server.post('/api/file/read', { onRequest: [server.authenticate] }, async (request, reply) => {
  const { filename } = request.body as FileBody;
  const { userId } = request.user as { userId: number };
  const context = { type: 'user', id: userId };

  const content = fs.readFile(context, filename);
  if (content === null) {
    return reply.status(404).send({ error: 'File not found' });
  }

  return { content };
});

server.post('/api/file/write', { onRequest: [server.authenticate] }, async (request, reply) => {
  const { filename, content } = request.body as FileBody;
  const { userId } = request.user as { userId: number };
  const context = { type: 'user', id: userId };

  const success = fs.writeFile(context, filename, content || '');
  if (!success) {
    return reply.status(500).send({ error: 'Failed to write file' });
  }

  return { success: true };
});

server.get('/api/file/list', { onRequest: [server.authenticate] }, async (request) => {
  const { path } = request.query as { path?: string };
  const { userId } = request.user as { userId: number };
  const context = { type: 'user', id: userId };

  const items = fs.listDirectory(context, path);
  return { items };
});

server.get('/api/export', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const context = { type: 'user', id: userId };

  const data = fs.exportData(context);
  return data;
});

server.post('/api/teams', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const { name, description } = request.body as TeamBody;
  const userModule = await import('../src/db');

  const team = userModule.createTeam(name, description, userId);
  return team;
});

server.get('/api/teams', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const userModule = await import('../src/db');
  const teams = userModule.getUserTeams(userId);
  return { teams };
});

server.get('/api/teams/:id/members', { onRequest: [server.authenticate] }, async (request, reply) => {
  const { id } = request.params as { id: string };
  const teamId = parseInt(id);
  const userModule = await import('../src/db');

  const members = userModule.getTeamMembers(teamId);
  return { members };
});

server.post('/api/plugins', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const pluginData = request.body as PluginBody;
  const userModule = await import('../src/db');

  const plugin = userModule.createPlugin({ ...pluginData, createdBy: userId });
  return { plugin };
});

server.get('/api/plugins/search', async (request) => {
  const { q } = request.query as { q: string };
  const userModule = await import('../src/db');
  const plugins = userModule.searchPlugins(q || '');
  return { plugins };
});

server.get('/api/plugins/mine', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const userModule = await import('../src/db');
  const plugins = userModule.getUserPlugins(userId);
  return { plugins };
});

server.get('/api/embed/generate', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const { theme, defaultPath, allowConfig, height, width } = request.query as {
    theme?: string;
    defaultPath?: string;
    allowConfig?: string;
    height?: string;
    width?: string;
  };

  const config = {
    theme: theme || 'dark',
    defaultPath: defaultPath || '/',
    allowConfig: allowConfig !== 'false',
    height: height || '600px',
    width: width || '100%',
    userId,
  };

  const embedCode = `<!-- Web CLI Embed Code -->
<div id="webcli-container"></div>
<script src="http://localhost:3950/embed.js" data-config='${JSON.stringify(config)}'></script>
<!-- End Web CLI Embed Code -->`;

  return {
    embedCode,
    config,
  };
});

let authToken: string;
let userId: number;
let teamId: number;

tap.test('Setup - Create test user and token', async () => {
  const user = createUser({
    email: 'auth@example.com',
    password: 'password123',
  });
  userId = user.id;
  authToken = server.jwt.sign({ userId: user.id, uuid: user.uuid });
});

tap.test('Authentication API', async (t) => {
  t.test('POST /api/auth/register - should register with email', async (t) => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'integration@example.com',
        password: 'password123',
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.ok(body.token, 'Should return token');
    t.ok(body.user, 'Should return user');
  });

  t.test('POST /api/auth/login - should login with email', async (t) => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'integration@example.com',
        password: 'password123',
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.ok(body.token, 'Should return token');
  });

  t.test('POST /api/auth/login - should reject invalid credentials', async (t) => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'integration@example.com',
        password: 'wrongpassword',
      },
    });
    t.equal(response.statusCode, 401, 'Should return 401');
  });

  t.test('GET /api/auth/me - should get current user', async (t) => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.equal(body.email, 'auth@example.com', 'Should return correct user');
  });
});

tap.test('File System API', async (t) => {
  t.test('POST /api/file/write - should write file', async (t) => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/file/write',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        filename: 'integration.txt',
        content: 'integration test content',
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
  });

  t.test('POST /api/file/read - should read file', async (t) => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/file/read',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        filename: 'integration.txt',
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.equal(body.content, 'integration test content', 'Should read correct content');
  });

  t.test('GET /api/file/list - should list directory', async (t) => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/file/list',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.ok(Array.isArray(body.items), 'Should return items array');
  });

  t.test('GET /api/export - should export data', async (t) => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/export',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.ok(body.nodes, 'Should have nodes');
  });
});

tap.test('Command Execution API', async (t) => {
  t.test('POST /api/execute - should execute pwd command', async (t) => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/execute',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        command: 'pwd',
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.ok(body.output, 'Should have output');
    t.ok(body.path, 'Should have path');
  });

  t.test('POST /api/execute - should execute ls command', async (t) => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/execute',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        command: 'ls',
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.ok(body.output, 'Should have output');
  });

  t.test('POST /api/execute - should execute whoami command', async (t) => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/execute',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        command: 'whoami',
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.ok(body.output, 'Should have output');
  });

  t.test('POST /api/completions - should get completions', async (t) => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/completions',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        partial: 'p',
        path: '/',
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.ok(Array.isArray(body.completions), 'Should return completions array');
  });
});

tap.test('Team API', async (t) => {
  t.test('POST /api/teams - should create team', async (t) => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/teams',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        name: 'Integration Team',
        description: 'Integration test team',
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.equal(body.name, 'Integration Team', 'Should have correct name');
    teamId = body.id;
  });

  t.test('GET /api/teams - should get user teams', async (t) => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/teams',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.ok(Array.isArray(body.teams), 'Should return teams array');
  });

  t.test('GET /api/teams/:id/members - should get team members', async (t) => {
    const response = await server.inject({
      method: 'GET',
      url: `/api/teams/${teamId}/members`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.ok(Array.isArray(body.members), 'Should return members array');
  });
});

tap.test('Plugin API', async (t) => {
  t.test('POST /api/plugins - should create plugin', async (t) => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/plugins',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        name: 'integration-plugin',
        description: 'Integration test plugin',
        version: '1.0.0',
        code: 'console.log("test")',
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
  });

  t.test('GET /api/plugins/search - should search plugins', async (t) => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/plugins/search?q=integration',
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.ok(Array.isArray(body.plugins), 'Should return plugins array');
  });

  t.test('GET /api/plugins/mine - should get user plugins', async (t) => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/plugins/mine',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.ok(Array.isArray(body.plugins), 'Should return plugins array');
  });
});

tap.test('Config and History API', async (t) => {
  t.test('GET /api/config - should get config', async (t) => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/config',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.ok(body.theme, 'Should have theme');
    t.ok(body.prompt, 'Should have prompt');
  });

  t.test('GET /api/history - should get history', async (t) => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/history',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.ok(Array.isArray(body.history), 'Should return history array');
  });

  t.test('GET /api/aliases - should get aliases', async (t) => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/aliases',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
  });
});

tap.test('Embed API', async (t) => {
  t.test('GET /api/embed/generate - should generate embed code', async (t) => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/embed/generate?theme=dark',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    t.equal(response.statusCode, 200, 'Should return 200');
    const body = JSON.parse(response.body);
    t.ok(body.embedCode, 'Should return embed code');
  });
});

tap.teardown(async () => {
  await server.close();
  db.close();
});
