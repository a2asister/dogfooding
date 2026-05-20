import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.SERVER_PORT || '38765', 10),
  },
  database: {
    path: path.resolve(process.env.DATABASE_URL || './data/cicd.db'),
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:38765/api/auth/github/callback',
    apiBaseUrl: 'https://api.github.com',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'cicd_platform_default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  session: {
    secret: process.env.SESSION_SECRET || 'cicd_platform_session_secret',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
  cors: {
    origin: ['http://localhost:42198', 'http://127.0.0.1:42198'],
    credentials: true,
  },
  pipeline: {
    defaultTimeout: 3600000,
    maxConcurrent: 5,
  },
} as const;

export const RBAC_PERMISSIONS = {
  admin: {
    modules: ['*'],
    permissions: [{ resource: '*', actions: ['*'] }],
  },
  developer: {
    modules: ['dashboard', 'repositories', 'pipelines', 'deployments', 'pr', 'alerts'],
    permissions: [
      { resource: 'repository', actions: ['read', 'create', 'update'] },
      { resource: 'pipeline', actions: ['read', 'run', 'create', 'update'] },
      { resource: 'deployment', actions: ['read', 'deploy'] },
      { resource: 'pr', actions: ['read', 'review'] },
    ],
  },
  tester: {
    modules: ['dashboard', 'pipelines', 'deployments', 'alerts'],
    permissions: [
      { resource: 'pipeline', actions: ['read', 'run'] },
      { resource: 'deployment', actions: ['read'] },
    ],
  },
  viewer: {
    modules: ['dashboard', 'repositories', 'pipelines', 'deployments', 'pr', 'alerts'],
    permissions: [{ resource: '*', actions: ['read'] }],
  },
} as const;

export const BRANCH_NAMING_PATTERNS = {
  feature: /^feature\/[\w-]+$/,
  bugfix: /^bugfix\/[\w-]+$/,
  hotfix: /^hotfix\/[\w-]+$/,
  release: /^release\/v?\d+\.\d+\.\d+$/,
  develop: /^develop$/,
  main: /^(main|master)$/,
} as const;

export const HIGH_RISK_OPERATIONS = [
  'repository:delete',
  'deployment:production',
  'rollback:production',
  'branch_protection:modify',
  'user:delete',
  'permission:modify',
] as const;
