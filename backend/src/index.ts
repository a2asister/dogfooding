import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import bcrypt from 'bcryptjs';
import {
  createUser,
  getUserByEmail,
  getUserByPhone,
  getUserByUsername,
  getUserById,
  verifyPassword,
  updateUser,
  getAllAliases,
  setAlias,
  deleteAlias,
  addCommandHistory,
  getCommandHistory,
  searchCommandHistory,
  deleteCommandHistory,
  clearCommandHistory,
  getConfig,
  setConfig,
  createTeam,
  getUserTeams,
  getTeamMembers,
  addTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
  createShare,
  getShareByUuid,
  deleteShare,
  createPlugin,
  getPluginById,
  searchPlugins,
  installPlugin,
  uninstallPlugin,
  getUserPlugins,
  type User,
} from './db';
import { fs, type FileSystemContext } from './filesystem';

const server = fastify({ logger: true });

void server.register(cors, {
  origin: true,
});

void server.register(jwt, {
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

server.post('/api/auth/register', async (request, reply) => {
  const { email, phone, username, password } = request.body as RegisterBody;

  if (!email && !phone && !username) {
    return reply.status(400).send({ error: 'Email, phone, or username is required' });
  }

  if (email && getUserByEmail(email)) {
    return reply.status(400).send({ error: 'Email already registered' });
  }

  if (phone && getUserByPhone(phone)) {
    return reply.status(400).send({ error: 'Phone already registered' });
  }

  if (username && getUserByUsername(username)) {
    return reply.status(400).send({ error: 'Username already taken' });
  }

  const user = createUser({ email, phone, username, password });

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

  let user: User | undefined;
  if (email) {
    user = getUserByEmail(email);
  } else if (phone) {
    user = getUserByPhone(phone);
  } else if (username) {
    user = getUserByUsername(username);
  }

  if (!user) {
    return reply.status(401).send({ error: 'Invalid credentials' });
  }

  if (!verifyPassword(user, password)) {
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
  const user = getUserById(userId);

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

server.put('/api/auth/profile', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const data = request.body as Partial<User>;

  const updated = updateUser(userId, data);
  if (!updated) {
    return { success: false };
  }

  const user = getUserById(userId);
  return {
    success: true,
    user: {
      id: user?.id,
      uuid: user?.uuid,
      email: user?.email,
      phone: user?.phone,
      username: user?.username,
      theme: user?.theme,
      promptFormat: user?.prompt_format,
    },
  };
});

function getContext(request: any): FileSystemContext | null {
  const body = request.body || {};
  const { contextType, contextId } = body as { contextType?: 'user' | 'team'; contextId?: number };
  const { userId } = request.user ? (request.user as { userId: number }) : { userId: null };

  if (contextType && contextId) {
    if (contextType === 'team') {
      const members = getTeamMembers(contextId);
      if (!members.some(m => m.user_id === userId)) {
        return null;
      }
    }
    return { type: contextType, id: contextId };
  }

  if (userId) {
    return { type: 'user', id: userId };
  }

  return null;
}

server.post('/api/execute', { onRequest: [server.authenticate] }, async (request, reply) => {
  const { command } = request.body as ExecuteBody;
  const context = getContext(request);

  if (typeof command !== 'string') {
    return reply.status(400).send({ error: 'Invalid command' });
  }

  if (!context) {
    return reply.status(400).send({ error: 'Invalid context' });
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
  const context = getContext(request);

  if (typeof partial !== 'string' || typeof path !== 'string') {
    return reply.status(400).send({ error: 'Invalid parameters' });
  }

  if (!context) {
    return reply.status(400).send({ error: 'Invalid context' });
  }

  const completions = getCompletions(partial, path, context);
  return { completions };
});

server.get('/api/path', { onRequest: [server.authenticate] }, async (request) => {
  const context = getContext(request);
  if (!context) {
    return { path: '/' };
  }
  return { path: fs.getCurrentPath(context) };
});

server.get('/api/config', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  return {
    theme: getConfig(userId, 'theme', 'dark'),
    prompt: getConfig(userId, 'prompt', '%user@%host:%path$ '),
  };
});

server.get('/api/aliases', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const aliases = getAllAliases(userId);
  return Object.fromEntries(aliases);
});

server.post('/api/aliases', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const { alias, command } = request.body as { alias: string; command: string };
  setAlias(userId, alias, command);
  return { success: true };
});

server.delete('/api/aliases/:alias', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const { alias } = request.params as { alias: string };
  const deleted = deleteAlias(userId, alias);
  return { success: deleted };
});

server.get('/api/history', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const { limit } = request.query as { limit?: number };
  const history = getCommandHistory(userId, limit);
  return { history };
});

server.delete('/api/history/:id', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const { id } = request.params as { id: string };
  const deleted = deleteCommandHistory(userId, parseInt(id));
  return { success: deleted };
});

server.delete('/api/history', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  clearCommandHistory(userId);
  return { success: true };
});

server.get('/api/history/search', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const { q } = request.query as { q: string };
  const history = searchCommandHistory(userId, q);
  return { history };
});

server.post('/api/file/read', { onRequest: [server.authenticate] }, async (request, reply) => {
  const { filename } = request.body as FileBody;
  const context = getContext(request);

  if (!context) {
    return reply.status(400).send({ error: 'Invalid context' });
  }

  const content = fs.readFile(context, filename);
  if (content === null) {
    return reply.status(404).send({ error: 'File not found' });
  }

  return { content };
});

server.post('/api/file/write', { onRequest: [server.authenticate] }, async (request, reply) => {
  const { filename, content } = request.body as FileBody;
  const context = getContext(request);

  if (!context) {
    return reply.status(400).send({ error: 'Invalid context' });
  }

  const success = fs.writeFile(context, filename, content || '');
  if (!success) {
    return reply.status(500).send({ error: 'Failed to write file' });
  }

  return { success: true };
});

server.get('/api/file/list', { onRequest: [server.authenticate] }, async (request, reply) => {
  const { path } = request.query as { path?: string };
  const context = getContext(request);

  if (!context) {
    return reply.status(400).send({ error: 'Invalid context' });
  }

  const items = fs.listDirectory(context, path);
  return { items };
});

server.get('/api/export', { onRequest: [server.authenticate] }, async (request, reply) => {
  const context = getContext(request);

  if (!context) {
    return reply.status(400).send({ error: 'Invalid context' });
  }

  const data = fs.exportData(context);
  return data;
});

server.post('/api/import', { onRequest: [server.authenticate] }, async (request, reply) => {
  const context = getContext(request);
  const data = request.body as { nodes: any[] };

  if (!context) {
    return reply.status(400).send({ error: 'Invalid context' });
  }

  const success = fs.importData(context, data);
  return { success };
});

server.post('/api/teams', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const { name, description } = request.body as TeamBody;

  const team = createTeam(name, description, userId);
  return team;
});

server.get('/api/teams', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const teams = getUserTeams(userId);
  return { teams };
});

server.get('/api/teams/:id/members', { onRequest: [server.authenticate] }, async (request, reply) => {
  const { userId } = request.user as { userId: number };
  const { id } = request.params as { id: string };
  const teamId = parseInt(id);

  const members = getTeamMembers(teamId);
  const isMember = members.some(m => m.user_id === userId);

  if (!isMember) {
    return reply.status(403).send({ error: 'Not a team member' });
  }

  return { members };
});

server.post('/api/teams/:id/members', { onRequest: [server.authenticate] }, async (request, reply) => {
  const { userId } = request.user as { userId: number };
  const { id } = request.params as { id: string };
  const teamId = parseInt(id);
  const { userId: targetUserId, role } = request.body as TeamMemberBody;

  const members = getTeamMembers(teamId);
  const currentMember = members.find(m => m.user_id === userId);

  if (!currentMember || currentMember.role !== 'admin') {
    return reply.status(403).send({ error: 'Not authorized' });
  }

  const success = addTeamMember(teamId, targetUserId, role);
  return { success };
});

server.put('/api/teams/:id/members/:userId', { onRequest: [server.authenticate] }, async (request, reply) => {
  const { userId } = request.user as { userId: number };
  const { id, userId: targetUserId } = request.params as { id: string; userId: string };
  const teamId = parseInt(id);
  const { role } = request.body as { role: 'admin' | 'member' | 'guest' };

  const members = getTeamMembers(teamId);
  const currentMember = members.find(m => m.user_id === userId);

  if (!currentMember || currentMember.role !== 'admin') {
    return reply.status(403).send({ error: 'Not authorized' });
  }

  const success = updateTeamMemberRole(teamId, parseInt(targetUserId), role);
  return { success };
});

server.delete('/api/teams/:id/members/:userId', { onRequest: [server.authenticate] }, async (request, reply) => {
  const { userId } = request.user as { userId: number };
  const { id, userId: targetUserId } = request.params as { id: string; userId: string };
  const teamId = parseInt(id);

  const members = getTeamMembers(teamId);
  const currentMember = members.find(m => m.user_id === userId);

  if (!currentMember || currentMember.role !== 'admin') {
    return reply.status(403).send({ error: 'Not authorized' });
  }

  const success = removeTeamMember(teamId, parseInt(targetUserId));
  return { success };
});

server.post('/api/shares', { onRequest: [server.authenticate] }, async (request, reply) => {
  const { userId } = request.user as { userId: number };
  const { nodeUuid, permission, expiresAt, password } = request.body as ShareBody;

  const nodeId = fs.getNodeIdByUuid(nodeUuid);
  if (!nodeId) {
    return reply.status(404).send({ error: 'File not found' });
  }

  if (!fs.canEdit(userId, nodeId)) {
    return reply.status(403).send({ error: 'Not authorized' });
  }

  const share = createShare(
    nodeId,
    userId,
    permission,
    expiresAt ? new Date(expiresAt) : undefined,
    password
  );

  return { share };
});

server.get('/api/shares/:uuid', async (request, reply) => {
  const { uuid } = request.params as { uuid: string };
  const share = getShareByUuid(uuid);

  if (!share) {
    return reply.status(404).send({ error: 'Share not found' });
  }

  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    return reply.status(410).send({ error: 'Share expired' });
  }

  const node = fs.getNodeById(Number(share.node_id));
  if (!node) {
    return reply.status(404).send({ error: 'File not found' });
  }

  return {
    share: {
      uuid: share.uuid,
      permission: share.permission,
      expiresAt: share.expires_at,
      hasPassword: !!share.password,
    },
    node: {
      name: node.name,
      type: node.type,
      content: share.permission === 'edit' ? node.content : undefined,
    },
  };
});

server.delete('/api/shares/:id', { onRequest: [server.authenticate] }, async (request) => {
  const { id } = request.params as { id: string };
  const success = deleteShare(parseInt(id));
  return { success };
});

server.post('/api/plugins', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const pluginData = request.body as PluginBody;

  const plugin = createPlugin({ ...pluginData, createdBy: userId });
  return { plugin };
});

server.get('/api/plugins/search', async (request) => {
  const { q } = request.query as { q: string };
  const plugins = searchPlugins(q || '');
  return { plugins };
});

server.get('/api/plugins/mine', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const plugins = getUserPlugins(userId);
  return { plugins };
});

server.post('/api/plugins/:id/install', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const { id } = request.params as { id: string };

  const success = installPlugin(userId, parseInt(id));
  return { success };
});

server.delete('/api/plugins/:id/uninstall', { onRequest: [server.authenticate] }, async (request) => {
  const { userId } = request.user as { userId: number };
  const { id } = request.params as { id: string };

  const success = uninstallPlugin(userId, parseInt(id));
  return { success };
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

  const embedCode = `<!-- WebCLI Embed Code -->
<div id="webcli-container"></div>
<script src="http://localhost:5173/embed.js" data-config='${JSON.stringify(config)}'></script>
<!-- End WebCLI Embed Code -->`;

  return {
    embedCode,
    config,
  };
});

server.get('/api/embed/public/:shareUuid', async (request, reply) => {
  const { shareUuid } = request.params as { shareUuid: string };
  const share = getShareByUuid(shareUuid);

  if (!share) {
    return reply.status(404).send({ error: 'Share not found' });
  }

  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    return reply.status(410).send({ error: 'Share expired' });
  }

  const node = fs.getNodeById(Number(share.node_id));
  if (!node) {
    return reply.status(404).send({ error: 'File not found' });
  }

  const { theme, height, width } = request.query as {
    theme?: string;
    height?: string;
    width?: string;
  };

  const config = {
    theme: theme || 'dark',
    height: height || '500px',
    width: width || '100%',
    shareUuid,
    permission: share.permission,
    readOnly: share.permission === 'read',
  };

  const embedCode = `<!-- WebCLI Public Share Embed Code -->
<div id="webcli-container"></div>
<script src="http://localhost:5173/embed.js" data-config='${JSON.stringify(config)}'></script>
<!-- End WebCLI Embed Code -->`;

  return {
    embedCode,
    config,
    fileName: node.name,
    fileType: node.type,
  };
});

function getCompletions(partial: string, path: string, context: FileSystemContext): string[] {
  const commandCompletions = Object.keys(commands).filter(cmd => cmd.startsWith(partial));

  const aliases = getAllAliases(context.id);
  const aliasCompletions = Array.from(aliases.keys()).filter(alias => alias.startsWith(partial));

  const fileCompletions = fs.listDirectory(context, path)
    .filter(item => item.name.startsWith(partial))
    .map(item => item.type === 'dir' ? `${item.name}/` : item.name);

  return [...new Set([...commandCompletions, ...aliasCompletions, ...fileCompletions])];
}

interface OutputLine {
  type: 'command' | 'result' | 'error' | 'warning' | 'info';
  content: string;
  icon?: string;
}

interface CommandResult {
  output: OutputLine[];
  path: string;
  clear?: boolean;
  completions?: string[];
}

type CommandHandler = (args: string[], context: FileSystemContext) => CommandResult;

const error = (content: string): OutputLine => ({ type: 'error', content });
const result = (content: string, icon?: string): OutputLine => ({ type: 'result', content, icon });
const info = (content: string): OutputLine => ({ type: 'info', content });

const parseArgs = (args: string[]) => {
  const flags: string[] = [];
  const positional: string[] = [];
  for (const arg of args) {
    if (arg.startsWith('-')) {
      flags.push(...arg.slice(1).split(''));
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const commands: Record<string, CommandHandler> = {
  pwd: (_args, context) => ({
    output: [result(fs.getCurrentPath(context))],
    path: fs.getCurrentPath(context),
  }),

  ls: (args: string[], context) => {
    const { flags, positional } = parseArgs(args);
    const showLong = flags.includes('l');
    const showAll = flags.includes('a');
    const targetPath = positional[0] || '';

    if (!fs.exists(context, targetPath) && targetPath) {
      return {
        output: [error(`ls: cannot access '${targetPath}': No such file or directory`)],
        path: fs.getCurrentPath(context),
      };
    }

    if (targetPath && fs.getType(context, targetPath) === 'file') {
      const nodeInfo = fs.getNodeInfo(context, targetPath);
      if (showLong && nodeInfo) {
        return {
          output: [result(`-  ${String(nodeInfo.size).padStart(6)}  ${formatDate(nodeInfo.created_at)}  ${nodeInfo.name}`)],
          path: fs.getCurrentPath(context),
        };
      }
      return {
        output: [result(targetPath)],
        path: fs.getCurrentPath(context),
      };
    }

    let items = fs.listDirectory(context, targetPath);
    if (!showAll) {
      items = items.filter(i => !i.name.startsWith('.'));
    }

    if (items.length === 0) {
      return { output: [], path: fs.getCurrentPath(context) };
    }

    if (showLong) {
      const lines: OutputLine[] = [];
      lines.push(info(`total ${items.length}`));
      for (const item of items) {
        const nodeInfo = fs.getNodeInfo(context, targetPath ? `${targetPath}/${item.name}` : item.name);
        const typeChar = item.type === 'dir' ? 'd' : '-';
        const size = String(nodeInfo?.size || 0).padStart(6);
        const date = nodeInfo ? formatDate(nodeInfo.created_at) : '';
        const icon = item.type === 'dir' ? '📁' : '📄';
        lines.push(result(`${typeChar}  ${size}  ${date}  ${item.name}`, icon));
      }
      return { output: lines, path: fs.getCurrentPath(context) };
    }

    return {
      output: items.map(item => result(item.name, item.type === 'dir' ? '📁' : '📄')),
      path: fs.getCurrentPath(context),
    };
  },

  cd: (args: string[], context) => {
    if (args.length === 0) {
      fs.setCurrentPath(context, '/');
      return {
        output: [],
        path: fs.getCurrentPath(context),
      };
    }
    const targetPath = args[0];
    if (!fs.exists(context, targetPath)) {
      return {
        output: [error(`cd: ${targetPath}: No such file or directory`)],
        path: fs.getCurrentPath(context),
      };
    }
    if (fs.getType(context, targetPath) !== 'dir') {
      return {
        output: [error(`cd: ${targetPath}: Not a directory`)],
        path: fs.getCurrentPath(context),
      };
    }
    fs.setCurrentPath(context, targetPath);
    return {
      output: [],
      path: fs.getCurrentPath(context),
    };
  },

  mkdir: (args: string[], context) => {
    if (args.length === 0) {
      return {
        output: [error('mkdir: missing operand')],
        path: fs.getCurrentPath(context),
      };
    }
    const dirName = args[0];
    if (fs.exists(context, dirName)) {
      return {
        output: [error(`mkdir: cannot create directory '${dirName}': File exists`)],
        path: fs.getCurrentPath(context),
      };
    }
    fs.createDirectory(context, dirName);
    return {
      output: [],
      path: fs.getCurrentPath(context),
    };
  },

  touch: (args: string[], context) => {
    if (args.length === 0) {
      return {
        output: [error('touch: missing file operand')],
        path: fs.getCurrentPath(context),
      };
    }
    const fileName = args[0];
    if (!fs.exists(context, fileName)) {
      fs.createFile(context, fileName);
    }
    return {
      output: [],
      path: fs.getCurrentPath(context),
    };
  },

  cat: (args: string[], context) => {
    if (args.length === 0) {
      return {
        output: [error('cat: missing file operand')],
        path: fs.getCurrentPath(context),
      };
    }
    const fileName = args[0];
    if (!fs.exists(context, fileName)) {
      return {
        output: [error(`cat: ${fileName}: No such file or directory`)],
        path: fs.getCurrentPath(context),
      };
    }
    if (fs.getType(context, fileName) === 'dir') {
      return {
        output: [error(`cat: ${fileName}: Is a directory`)],
        path: fs.getCurrentPath(context),
      };
    }
    const content = fs.readFile(context, fileName);
    return {
      output: content ? [result(content)] : [],
      path: fs.getCurrentPath(context),
    };
  },

  rm: (args: string[], context) => {
    const { flags, positional } = parseArgs(args);
    const recursive = flags.includes('r') || flags.includes('R');
    const force = flags.includes('f');

    if (positional.length === 0) {
      return {
        output: [error('rm: missing operand')],
        path: fs.getCurrentPath(context),
      };
    }

    const target = positional[0];
    if (!fs.exists(context, target)) {
      if (!force) {
        return {
          output: [error(`rm: cannot remove '${target}': No such file or directory`)],
          path: fs.getCurrentPath(context),
        };
      }
      return { output: [], path: fs.getCurrentPath(context) };
    }

    const type = fs.getType(context, target);
    if (type === 'dir' && !recursive) {
      return {
        output: [error(`rm: cannot remove '${target}': Is a directory`)],
        path: fs.getCurrentPath(context),
      };
    }

    const success = fs.delete(context, target, recursive);
    if (!success && !force) {
      return {
        output: [error(`rm: failed to remove '${target}'`)],
        path: fs.getCurrentPath(context),
      };
    }

    return { output: [], path: fs.getCurrentPath(context) };
  },

  mv: (args: string[], context) => {
    if (args.length < 2) {
      return {
        output: [error('mv: missing operand')],
        path: fs.getCurrentPath(context),
      };
    }

    const source = args[0];
    const destination = args[1];

    if (!fs.exists(context, source)) {
      return {
        output: [error(`mv: cannot stat '${source}': No such file or directory`)],
        path: fs.getCurrentPath(context),
      };
    }

    const success = fs.move(context, source, destination);
    if (!success) {
      return {
        output: [error(`mv: cannot move '${source}' to '${destination}'`)],
        path: fs.getCurrentPath(context),
      };
    }

    return { output: [], path: fs.getCurrentPath(context) };
  },

  cp: (args: string[], context) => {
    if (args.length < 2) {
      return {
        output: [error('cp: missing operand')],
        path: fs.getCurrentPath(context),
      };
    }

    const source = args[0];
    const destination = args[1];

    if (!fs.exists(context, source)) {
      return {
        output: [error(`cp: cannot stat '${source}': No such file or directory`)],
        path: fs.getCurrentPath(context),
      };
    }

    const success = fs.copy(context, source, destination);
    if (!success) {
      return {
        output: [error(`cp: cannot copy '${source}' to '${destination}'`)],
        path: fs.getCurrentPath(context),
      };
    }

    return { output: [], path: fs.getCurrentPath(context) };
  },

  echo: (args, context) => ({
    output: [result(args.join(' '))],
    path: fs.getCurrentPath(context),
  }),

  whoami: (_args, context) => {
    const user = getUserById(context.id);
    return {
      output: [result(user?.username || 'unknown')],
      path: fs.getCurrentPath(context),
    };
  },

  hostname: (_args, context) => ({
    output: [result(context.type === 'team' ? 'team-cli' : 'web-cli')],
    path: fs.getCurrentPath(context),
  }),

  uname: (_args, context) => ({
    output: [result('WebCLI OS 2.0.0')],
    path: fs.getCurrentPath(context),
  }),

  date: (_args, context) => ({
    output: [result(new Date().toString())],
    path: fs.getCurrentPath(context),
  }),

  grep: (args: string[], context) => {
    if (args.length < 2) {
      return {
        output: [error('grep: missing operand')],
        path: fs.getCurrentPath(context),
      };
    }

    const pattern = args[0];
    const fileName = args[1];

    if (!fs.exists(context, fileName)) {
      return {
        output: [error(`grep: ${fileName}: No such file or directory`)],
        path: fs.getCurrentPath(context),
      };
    }

    if (fs.getType(context, fileName) === 'dir') {
      return {
        output: [error(`grep: ${fileName}: Is a directory`)],
        path: fs.getCurrentPath(context),
      };
    }

    const content = fs.readFile(context, fileName) || '';
    const lines = content.split('\n');
    const regex = new RegExp(pattern);
    const matches = lines.filter(line => regex.test(line));

    return {
      output: matches.map(line => result(line)),
      path: fs.getCurrentPath(context),
    };
  },

  head: (args: string[], context) => {
    if (args.length === 0) {
      return {
        output: [error('head: missing file operand')],
        path: fs.getCurrentPath(context),
      };
    }

    const fileName = args[0];
    const count = parseInt(args[1]) || 10;

    if (!fs.exists(context, fileName)) {
      return {
        output: [error(`head: ${fileName}: No such file or directory`)],
        path: fs.getCurrentPath(context),
      };
    }

    if (fs.getType(context, fileName) === 'dir') {
      return {
        output: [error(`head: ${fileName}: Is a directory`)],
        path: fs.getCurrentPath(context),
      };
    }

    const content = fs.readFile(context, fileName) || '';
    const lines = content.split('\n').slice(0, count);

    return {
      output: lines.map(line => result(line)),
      path: fs.getCurrentPath(context),
    };
  },

  tail: (args: string[], context) => {
    if (args.length === 0) {
      return {
        output: [error('tail: missing file operand')],
        path: fs.getCurrentPath(context),
      };
    }

    const fileName = args[0];
    const count = parseInt(args[1]) || 10;

    if (!fs.exists(context, fileName)) {
      return {
        output: [error(`tail: ${fileName}: No such file or directory`)],
        path: fs.getCurrentPath(context),
      };
    }

    if (fs.getType(context, fileName) === 'dir') {
      return {
        output: [error(`tail: ${fileName}: Is a directory`)],
        path: fs.getCurrentPath(context),
      };
    }

    const content = fs.readFile(context, fileName) || '';
    const lines = content.split('\n').slice(-count);

    return {
      output: lines.map(line => result(line)),
      path: fs.getCurrentPath(context),
    };
  },

  wc: (args: string[], context) => {
    if (args.length === 0) {
      return {
        output: [error('wc: missing file operand')],
        path: fs.getCurrentPath(context),
      };
    }

    const fileName = args[0];

    if (!fs.exists(context, fileName)) {
      return {
        output: [error(`wc: ${fileName}: No such file or directory`)],
        path: fs.getCurrentPath(context),
      };
    }

    if (fs.getType(context, fileName) === 'dir') {
      return {
        output: [error(`wc: ${fileName}: Is a directory`)],
        path: fs.getCurrentPath(context),
      };
    }

    const content = fs.readFile(context, fileName) || '';
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).filter(Boolean).length;
    const chars = content.length;

    return {
      output: [result(`  ${lines}  ${words}  ${chars} ${fileName}`)],
      path: fs.getCurrentPath(context),
    };
  },

  clear: (_args, context) => ({
    output: [],
    path: fs.getCurrentPath(context),
    clear: true,
  }),

  theme: (args: string[], context) => {
    const themes = ['dark', 'light', 'retro-green', 'hacker'];

    if (args.length === 0) {
      const currentTheme = getConfig(context.id, 'theme', 'dark');
      return {
        output: [info(`Current theme: ${currentTheme}\nAvailable themes: ${themes.join(', ')}`)],
        path: fs.getCurrentPath(context),
      };
    }

    const themeName = args[0];
    if (!themes.includes(themeName)) {
      return {
        output: [error(`Unknown theme: ${themeName}\nAvailable themes: ${themes.join(', ')}`)],
        path: fs.getCurrentPath(context),
      };
    }

    setConfig(context.id, 'theme', themeName);
    return {
      output: [result(`Theme changed to: ${themeName}`)],
      path: fs.getCurrentPath(context),
    };
  },

  alias: (args: string[], context) => {
    if (args.length === 0) {
      const aliases = getAllAliases(context.id);
      if (aliases.size === 0) {
        return {
          output: [info('No aliases defined')],
          path: fs.getCurrentPath(context),
        };
      }
      const aliasList = Array.from(aliases.entries())
        .map(([alias, cmd]) => `${alias}='${cmd}'`)
        .join('\n');
      return {
        output: [result(aliasList)],
        path: fs.getCurrentPath(context),
      };
    }

    if (args[0] === '-d' && args.length >= 2) {
      const aliasName = args[1];
      const deleted = deleteAlias(context.id, aliasName);
      if (deleted) {
        return {
          output: [result(`Alias '${aliasName}' deleted`)],
          path: fs.getCurrentPath(context),
        };
      }
      return {
        output: [error(`Alias '${aliasName}' not found`)],
        path: fs.getCurrentPath(context),
      };
    }

    const fullArg = args.join(' ');
    const match = fullArg.match(/^([a-zA-Z0-9_-]+)=(.+)$/);
    if (!match) {
      return {
        output: [error('Usage: alias name=command\n       alias -d name')],
        path: fs.getCurrentPath(context),
      };
    }

    const [, aliasName, command] = match;
    setAlias(context.id, aliasName, command);
    return {
      output: [result(`Alias '${aliasName}' set to '${command}'`)],
      path: fs.getCurrentPath(context),
    };
  },

  prompt: (args: string[], context) => {
    if (args.length === 0) {
      const currentPrompt = getConfig(context.id, 'prompt', '%user@%host:%path$ ');
      return {
        output: [info(`Current prompt format: ${currentPrompt}\nVariables: %user, %host, %path, %time, %date`)],
        path: fs.getCurrentPath(context),
      };
    }

    const newPrompt = args.join(' ');
    setConfig(context.id, 'prompt', newPrompt);
    return {
      output: [result(`Prompt format changed to: ${newPrompt}`)],
      path: fs.getCurrentPath(context),
    };
  },

  history: (args: string[], context) => {
    const { flags, positional } = parseArgs(args);

    if (flags.includes('c') || flags.includes('clear')) {
      clearCommandHistory(context.id);
      return {
        output: [result('History cleared')],
        path: fs.getCurrentPath(context),
      };
    }

    if (flags.includes('d') && positional.length > 0) {
      const id = parseInt(positional[0]);
      if (isNaN(id)) {
        return {
          output: [error('Invalid history ID')],
          path: fs.getCurrentPath(context),
        };
      }
      const deleted = deleteCommandHistory(context.id, id);
      if (deleted) {
        return {
          output: [result(`History entry ${id} deleted`)],
          path: fs.getCurrentPath(context),
        };
      }
      return {
        output: [error(`History entry ${id} not found`)],
        path: fs.getCurrentPath(context),
      };
    }

    if (flags.includes('s') && positional.length > 0) {
      const pattern = positional.join(' ');
      const history = searchCommandHistory(context.id, pattern);
      if (history.length === 0) {
        return {
          output: [info('No matching history entries')],
          path: fs.getCurrentPath(context),
        };
      }
      const historyList = history.reverse().map(h => `  ${h.id}  ${h.command}`).join('\n');
      return {
        output: [result(historyList)],
        path: fs.getCurrentPath(context),
      };
    }

    const limit = positional[0] ? parseInt(positional[0]) : undefined;
    const history = getCommandHistory(context.id, limit);
    if (history.length === 0) {
      return {
        output: [info('No history entries')],
        path: fs.getCurrentPath(context),
      };
    }
    const historyList = history.reverse().map(h => `  ${h.id}  ${h.command}`).join('\n');
    return {
      output: [result(historyList)],
      path: fs.getCurrentPath(context),
    };
  },

  share: (args, context) => {
    if (args.length === 0) {
      return {
        output: [error('Usage: share <file|folder> [-p permission] [-e expires]')],
        path: fs.getCurrentPath(context),
      };
    }

    let permission = 'read';
    let expiresAt = null;
    const positional = [];

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-p' && i + 1 < args.length) {
        permission = args[i + 1];
        i++;
      } else if (args[i] === '-e' && i + 1 < args.length) {
        expiresAt = args[i + 1];
        i++;
      } else {
        positional.push(args[i]);
      }
    }

    if (positional.length === 0) {
      return {
        output: [error('Please specify a file or folder to share')],
        path: fs.getCurrentPath(context),
      };
    }

    const targetPath = positional[0];
    const node = fs.getNode(context, targetPath);
    if (!node) {
      return {
        output: [error(`File or folder not found: ${targetPath}`)],
        path: fs.getCurrentPath(context),
      };
    }

    const expiresDate = expiresAt ? new Date(expiresAt) : undefined;
    const validPermission = (permission === 'read' || permission === 'edit') ? permission : 'read';
    const share = createShare(node.id, context.id, validPermission, expiresDate);
    const shareUrl = `http://localhost:3950/api/shares/${share.uuid}`;

    return {
      output: [
        result(`✅ Share created successfully!`),
        result(`   File: ${node.name}`),
        result(`   Type: ${node.type}`),
        result(`   Permission: ${permission}`),
        result(`   Expires: ${expiresAt || 'Never'}`),
        result(`   Share URL: ${shareUrl}`),
        result(`   Embed Code: <script src="http://localhost:3950/api/embed/public/${share.uuid}"></script>`),
      ],
      path: fs.getCurrentPath(context),
    };
  },

  team: (args, context) => {
    if (args.length === 0) {
      return {
        output: [
          info('Team management commands:'),
          info('  team list              List all teams'),
          info('  team create <name>     Create new team'),
          info('  team members           List team members'),
          info('  team add <userId>      Add member to team'),
          info('  team remove <userId>   Remove member from team'),
          info('  team role <userId> <role>  Change member role (admin/member/guest)'),
        ],
        path: fs.getCurrentPath(context),
      };
    }

    const subCommand = args[0];

    if (subCommand === 'list') {
      const teams = getUserTeams(context.id);
      if (teams.length === 0) {
        return {
          output: [info('No teams found. Create one with: team create <name>')],
          path: fs.getCurrentPath(context),
        };
      }
      const teamList = teams.map(t => `  ${t.id}  ${t.name}`).join('\n');
      return {
        output: [result(teamList)],
        path: fs.getCurrentPath(context),
      };
    }

    if (subCommand === 'create' && args.length >= 2) {
      const name = args.slice(1).join(' ');
      const team = createTeam(name, '', context.id);
      return {
        output: [result(`✅ Team '${team.name}' created successfully! (ID: ${team.id})`)],
        path: fs.getCurrentPath(context),
      };
    }

    if (context.type !== 'team') {
      return {
        output: [error('⚠️  Switch to a team context first using the sidebar')],
        path: fs.getCurrentPath(context),
      };
    }

    if (subCommand === 'members') {
      const members = getTeamMembers(context.id);
      if (members.length === 0) {
        return {
          output: [info('No members in this team')],
          path: fs.getCurrentPath(context),
        };
      }
      const memberList = members.map(m => `  ${m.user_id}  ${m.username || m.email || 'User'}  (${m.role})`).join('\n');
      return {
        output: [result(memberList)],
        path: fs.getCurrentPath(context),
      };
    }

    if (subCommand === 'add' && args.length >= 2) {
      const userId = parseInt(args[1]);
      const role = args[2] || 'member';
      const success = addTeamMember(context.id, userId, role);
      if (success) {
        return {
          output: [result(`✅ User ${userId} added to team as ${role}`)],
          path: fs.getCurrentPath(context),
        };
      }
      return {
        output: [error('❌ Failed to add member to team')],
        path: fs.getCurrentPath(context),
      };
    }

    if (subCommand === 'remove' && args.length >= 2) {
      const userId = parseInt(args[1]);
      const success = removeTeamMember(context.id, userId);
      if (success) {
        return {
          output: [result(`✅ User ${userId} removed from team`)],
          path: fs.getCurrentPath(context),
        };
      }
      return {
        output: [error('❌ Failed to remove member from team')],
        path: fs.getCurrentPath(context),
      };
    }

    if (subCommand === 'role' && args.length >= 3) {
      const userId = parseInt(args[1]);
      const role = args[2];
      const success = updateTeamMemberRole(context.id, userId, role);
      if (success) {
        return {
          output: [result(`✅ User ${userId} role updated to ${role}`)],
          path: fs.getCurrentPath(context),
        };
      }
      return {
        output: [error('❌ Failed to update member role')],
        path: fs.getCurrentPath(context),
      };
    }

    return {
      output: [error('Invalid team command. Use: team help')],
      path: fs.getCurrentPath(context),
    };
  },

  help: (_args, context) => {
    const helpText = `
Available commands:
  pwd              Print current working directory
  ls [-la] [path]  List directory contents
  cd [path]        Change working directory
  mkdir <name>     Create a new directory
  touch <name>     Create a new empty file
  cat <file>       Display file contents
  rm [-rf] <path>  Remove files or directories
  mv <src> <dest>  Move/rename files or directories
  cp <src> <dest>  Copy files or directories
  echo <text>      Display text
  whoami           Print current user name
  hostname         Print hostname
  uname            Print system information
  date             Print current date and time
  grep <pattern> <file>  Search for pattern in file
  head [-n] <file> Print first lines of file
  tail [-n] <file> Print last lines of file
  wc <file>        Count lines, words, characters
  clear            Clear the terminal screen
  theme [name]     Change terminal theme
  alias [name=cmd] Set/list command aliases
  alias -d <name>  Delete alias
  prompt [format]  Customize command prompt
  history [n]      Show command history
  history -c       Clear history
  history -d <id>  Delete history entry
  history -s <pat> Search history
  share <file> [-p read|edit] [-e expires]  Create share link
  team help        Show team management commands
  help             Show this help message
    `.trim();
    return {
      output: [info(helpText)],
      path: fs.getCurrentPath(context),
    };
  },
};

export function executeCommand(input: string, context: FileSystemContext): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { output: [], path: fs.getCurrentPath(context) };
  }

  addCommandHistory(context.id, trimmed, fs.getCurrentPath(context));

  const aliases = getAllAliases(context.id);
  let processedInput = trimmed;
  const firstSpace = trimmed.indexOf(' ');
  const firstWord = firstSpace === -1 ? trimmed : trimmed.substring(0, firstSpace);

  if (aliases.has(firstWord)) {
    const aliasValue = aliases.get(firstWord)!;
    processedInput = firstSpace === -1 ? aliasValue : aliasValue + trimmed.substring(firstSpace);
  }

  const parts = processedInput.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  const handler = commands[cmd];
  if (handler === undefined) {
    return {
      output: [error(`${cmd}: command not found`)],
      path: fs.getCurrentPath(context),
    };
  }

  return handler(args, context);
}

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
