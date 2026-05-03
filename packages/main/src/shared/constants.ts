import { AppStatus, VersionStatus } from './types';

export const APP_STATUS_LABELS: Record<AppStatus, string> = {
  developing: '开发中',
  testing: '测试中',
  staging: '预发布',
  production: '生产环境',
  disabled: '已禁用',
};

export const APP_STATUS_COLORS: Record<AppStatus, string> = {
  developing: 'processing',
  testing: 'warning',
  staging: 'default',
  production: 'success',
  disabled: 'error',
};

export const VERSION_STATUS_LABELS: Record<VersionStatus, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
  deprecated: '已废弃',
};

export const VERSION_STATUS_COLORS: Record<VersionStatus, string> = {
  draft: 'default',
  published: 'success',
  archived: 'warning',
  deprecated: 'error',
};

export const APP_CATEGORIES = [
  { value: 'dashboard', label: '数据看板' },
  { value: 'analytics', label: '数据分析' },
  { value: 'system', label: '系统管理' },
  { value: 'workflow', label: '工作流' },
  { value: 'content', label: '内容管理' },
  { value: 'ecommerce', label: '电商' },
  { value: 'tools', label: '工具集' },
  { value: 'other', label: '其他' },
];

export const DEFAULT_SANDBOX_CONFIG = {
  enabled: true,
  strictStyleIsolation: false,
  experimentalStyleIsolation: true,
  props: {},
};

export const DEFAULT_APP: Omit<
  import('./types').MicroApp,
  'id' | 'createdAt' | 'updatedAt'
> = {
  name: '',
  displayName: '',
  description: '',
  icon: 'AppstoreOutlined',
  category: 'other',
  author: '',
  status: 'developing',
  currentVersion: '',
  versions: [],
  routes: [],
  sandboxConfig: DEFAULT_SANDBOX_CONFIG,
};
