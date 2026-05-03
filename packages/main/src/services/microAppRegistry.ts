import {
  MicroApp,
  AppVersion,
  AppRoute,
  AppRegistry,
  generateId,
  DEFAULT_SANDBOX_CONFIG,
  SandboxConfig,
} from '@/shared';

const STORAGE_KEY = 'micro_apps';
const STORAGE_VERSION_KEY = 'micro_apps_version';
const CURRENT_VERSION = 2;

const ensureHttpPrefix = (entry: string): string => {
  if (!entry) return entry;
  if (entry.startsWith('//')) {
    return `http:${entry}`;
  }
  if (!entry.startsWith('http://') && !entry.startsWith('https://')) {
    return `http://${entry}`;
  }
  return entry;
};

const isValidMicroApp = (app: unknown): app is MicroApp => {
  if (
    typeof app === 'object' &&
    app !== null &&
    typeof (app as MicroApp).id === 'string' &&
    typeof (app as MicroApp).name === 'string' &&
    typeof (app as MicroApp).displayName === 'string' &&
    Array.isArray((app as MicroApp).versions) &&
    Array.isArray((app as MicroApp).routes) &&
    typeof (app as MicroApp).sandboxConfig === 'object'
  ) {
    return true;
  }
  return false;
};

const migrateAppData = (app: MicroApp): MicroApp => {
  const migratedApp = { ...app };

  migratedApp.versions = (migratedApp.versions || []).map((version) => ({
    ...version,
    entry: ensureHttpPrefix(version.entry),
  }));

  if (!migratedApp.sandboxConfig) {
    migratedApp.sandboxConfig = { ...DEFAULT_SANDBOX_CONFIG };
  } else {
    migratedApp.sandboxConfig = {
      ...DEFAULT_SANDBOX_CONFIG,
      ...migratedApp.sandboxConfig,
    };
  }

  if (!migratedApp.routes) {
    migratedApp.routes = [];
  }

  if (!migratedApp.status) {
    migratedApp.status = 'development';
  }

  return migratedApp;
};

class MicroAppRegistry implements AppRegistry {
  private _apps: MicroApp[] = [];

  constructor() {
    this.loadFromStorage();
    if (this._apps.length === 0) {
      this.initializeSampleApps();
    }
  }

  get apps(): MicroApp[] {
    return [...this._apps];
  }

  getAppById(id: string): MicroApp | undefined {
    return this._apps.find((app) => app.id === id);
  }

  getAppByName(name: string): MicroApp | undefined {
    return this._apps.find((app) => app.name === name);
  }

  registerApp(app: Omit<MicroApp, 'id' | 'createdAt' | 'updatedAt'>): MicroApp {
    const now = new Date().toISOString();
    const newApp: MicroApp = {
      ...app,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    this._apps.push(newApp);
    this.saveToStorage();
    return newApp;
  }

  updateApp(app: MicroApp): void {
    const index = this._apps.findIndex((a) => a.id === app.id);
    if (index !== -1) {
      this._apps[index] = {
        ...app,
        updatedAt: new Date().toISOString(),
      };
      this.saveToStorage();
    }
  }

  removeApp(id: string): void {
    const index = this._apps.findIndex((a) => a.id === id);
    if (index !== -1) {
      this._apps.splice(index, 1);
      this.saveToStorage();
    }
  }

  addVersion(appId: string, version: Omit<AppVersion, 'id' | 'createdAt' | 'updatedAt'>): AppVersion {
    const app = this.getAppById(appId);
    if (!app) {
      throw new Error(`App with id ${appId} not found`);
    }

    const now = new Date().toISOString();
    const newVersion: AppVersion = {
      ...version,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    if (version.isDefault) {
      app.versions = app.versions.map((v) => ({ ...v, isDefault: false }));
    }

    app.versions.push(newVersion);
    
    if (!app.currentVersion || version.isDefault) {
      app.currentVersion = version.version;
    }

    this.updateApp(app);
    return newVersion;
  }

  updateVersion(appId: string, version: AppVersion): void {
    const app = this.getAppById(appId);
    if (!app) {
      throw new Error(`App with id ${appId} not found`);
    }

    const index = app.versions.findIndex((v) => v.id === version.id);
    if (index === -1) {
      throw new Error(`Version with id ${version.id} not found`);
    }

    if (version.isDefault) {
      app.versions = app.versions.map((v) => ({
        ...v,
        isDefault: v.id === version.id,
      }));
      app.currentVersion = version.version;
    }

    app.versions[index] = {
      ...version,
      updatedAt: new Date().toISOString(),
    };

    this.updateApp(app);
  }

  removeVersion(appId: string, versionId: string): void {
    const app = this.getAppById(appId);
    if (!app) {
      throw new Error(`App with id ${appId} not found`);
    }

    const version = app.versions.find((v) => v.id === versionId);
    if (!version) {
      return;
    }

    app.versions = app.versions.filter((v) => v.id !== versionId);

    if (version.isDefault && app.versions.length > 0) {
      app.versions[0].isDefault = true;
      app.currentVersion = app.versions[0].version;
    } else if (app.versions.length === 0) {
      app.currentVersion = '';
    }

    this.updateApp(app);
  }

  addRoute(appId: string, route: Omit<AppRoute, 'id'>): AppRoute {
    const app = this.getAppById(appId);
    if (!app) {
      throw new Error(`App with id ${appId} not found`);
    }

    const newRoute: AppRoute = {
      ...route,
      id: generateId(),
    };

    app.routes.push(newRoute);
    this.updateApp(app);
    return newRoute;
  }

  updateRoute(appId: string, route: AppRoute): void {
    const app = this.getAppById(appId);
    if (!app) {
      throw new Error(`App with id ${appId} not found`);
    }

    const index = app.routes.findIndex((r) => r.id === route.id);
    if (index === -1) {
      throw new Error(`Route with id ${route.id} not found`);
    }

    app.routes[index] = route;
    this.updateApp(app);
  }

  removeRoute(appId: string, routeId: string): void {
    const app = this.getAppById(appId);
    if (!app) {
      throw new Error(`App with id ${appId} not found`);
    }

    app.routes = app.routes.filter((r) => r.id !== routeId);
    this.updateApp(app);
  }

  private loadFromStorage(): void {
    try {
      const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      const data = localStorage.getItem(STORAGE_KEY);

      if (data) {
        const parsedData = JSON.parse(data) as unknown[];

        if (storedVersion !== String(CURRENT_VERSION)) {
          console.log(`[MicroAppRegistry] Migrating data from version ${storedVersion} to ${CURRENT_VERSION}`);

          const validApps: MicroApp[] = [];
          parsedData.forEach((app) => {
            if (isValidMicroApp(app)) {
              validApps.push(migrateAppData(app));
            } else {
              console.warn('[MicroAppRegistry] Invalid app data found, skipping:', app);
            }
          });

          this._apps = validApps;
          this.saveToStorage();
          localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION));
        } else {
          const validApps: MicroApp[] = [];
          parsedData.forEach((app) => {
            if (isValidMicroApp(app)) {
              validApps.push(app);
            }
          });
          this._apps = validApps;
        }
      }
    } catch (error) {
      console.error('Failed to load apps from storage:', error);
      this._apps = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._apps));
      localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION));
    } catch (error) {
      console.error('Failed to save apps to storage:', error);
    }
  }

  resetToDefault(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_VERSION_KEY);
      this._apps = [];
      this.initializeSampleApps();
      console.log('[MicroAppRegistry] Data reset to defaults');
    } catch (error) {
      console.error('Failed to reset storage:', error);
    }
  }

  private initializeSampleApps(): void {
    const now = new Date().toISOString();
    
    const sampleApps: MicroApp[] = [
      {
        id: generateId(),
        name: 'dashboard',
        displayName: '数据看板',
        description: '企业级数据可视化仪表盘，支持多维度数据分析和实时监控',
        icon: 'DashboardOutlined',
        category: 'dashboard',
        author: '技术平台部',
        status: 'production',
        createdAt: now,
        updatedAt: now,
        currentVersion: '1.2.0',
        versions: [
          {
            id: generateId(),
            version: '1.2.0',
            name: '数据驱动',
            description: '新增智能分析功能',
            entry: 'http://localhost:3001',
            status: 'published',
            createdAt: now,
            updatedAt: now,
            isDefault: true,
            changelog: '1. 新增AI智能数据分析功能\n2. 优化图表渲染性能\n3. 修复移动端适配问题\n4. 增加深色模式支持',
            dependencies: { 'react': '^18.2.0' },
          },
          {
            id: generateId(),
            version: '1.1.0',
            name: '性能优化',
            description: '提升加载速度和交互体验',
            entry: 'http://localhost:3001/v1.1',
            status: 'archived',
            createdAt: now,
            updatedAt: now,
            isDefault: false,
            changelog: '1. 优化数据加载性能\n2. 增加缓存机制\n3. 修复已知问题',
            dependencies: { 'react': '^18.2.0' },
          },
        ],
        routes: [
          {
            id: generateId(),
            path: '/dashboard',
            name: 'overview',
            title: '总览',
            icon: 'BarChartOutlined',
            order: 1,
            visibleInMenu: true,
            meta: {},
          },
          {
            id: generateId(),
            path: '/dashboard/analytics',
            name: 'analytics',
            title: '数据分析',
            icon: 'PieChartOutlined',
            order: 2,
            visibleInMenu: true,
            meta: {},
          },
          {
            id: generateId(),
            path: '/dashboard/reports',
            name: 'reports',
            title: '报表中心',
            icon: 'FileTextOutlined',
            order: 3,
            visibleInMenu: true,
            meta: {},
          },
        ],
        sandboxConfig: {
          ...DEFAULT_SANDBOX_CONFIG,
          strictStyleIsolation: false,
          experimentalStyleIsolation: true,
        },
      },
      {
        id: generateId(),
        name: 'user-center',
        displayName: '用户中心',
        description: '统一用户管理系统，包含用户信息、权限管理、安全设置等功能',
        icon: 'UserOutlined',
        category: 'system',
        author: '用户体验部',
        status: 'production',
        createdAt: now,
        updatedAt: now,
        currentVersion: '2.0.1',
        versions: [
          {
            id: generateId(),
            version: '2.0.1',
            name: '安全加固',
            description: '提升系统安全性',
            entry: 'http://localhost:3002',
            status: 'published',
            createdAt: now,
            updatedAt: now,
            isDefault: true,
            changelog: '1. 修复安全漏洞\n2. 优化登录流程\n3. 增加双因素认证',
            dependencies: { 'react': '^18.2.0' },
          },
        ],
        routes: [
          {
            id: generateId(),
            path: '/user/profile',
            name: 'profile',
            title: '个人资料',
            icon: 'ProfileOutlined',
            order: 1,
            visibleInMenu: true,
            meta: {},
          },
          {
            id: generateId(),
            path: '/user/security',
            name: 'security',
            title: '安全设置',
            icon: 'SafetyOutlined',
            order: 2,
            visibleInMenu: true,
            meta: {},
          },
          {
            id: generateId(),
            path: '/user/permissions',
            name: 'permissions',
            title: '权限管理',
            icon: 'LockOutlined',
            order: 3,
            visibleInMenu: true,
            meta: {},
          },
        ],
        sandboxConfig: DEFAULT_SANDBOX_CONFIG,
      },
      {
        id: generateId(),
        name: 'workflow',
        displayName: '工作流引擎',
        description: '可视化工作流设计器，支持流程编排、任务分配、审批流转',
        icon: 'BuildOutlined',
        category: 'workflow',
        author: '流程自动化部',
        status: 'testing',
        createdAt: now,
        updatedAt: now,
        currentVersion: '0.9.0',
        versions: [
          {
            id: generateId(),
            version: '0.9.0',
            name: 'Beta测试',
            description: '内部测试版本',
            entry: 'http://localhost:3003',
            status: 'draft',
            createdAt: now,
            updatedAt: now,
            isDefault: true,
            changelog: '1. 完成可视化设计器\n2. 支持多种节点类型\n3. 增加模拟测试功能',
            dependencies: { 'react': '^18.2.0' },
          },
        ],
        routes: [
          {
            id: generateId(),
            path: '/workflow/designer',
            name: 'designer',
            title: '流程设计',
            icon: 'ApartmentOutlined',
            order: 1,
            visibleInMenu: true,
            meta: {},
          },
          {
            id: generateId(),
            path: '/workflow/instances',
            name: 'instances',
            title: '实例管理',
            icon: 'ContainerOutlined',
            order: 2,
            visibleInMenu: true,
            meta: {},
          },
          {
            id: generateId(),
            path: '/workflow/tasks',
            name: 'tasks',
            title: '我的任务',
            icon: 'ToDoOutlined',
            order: 3,
            visibleInMenu: true,
            meta: {},
          },
        ],
        sandboxConfig: DEFAULT_SANDBOX_CONFIG,
      },
      {
        id: generateId(),
        name: 'content-manager',
        displayName: '内容管理',
        description: '企业级内容管理系统，支持多渠道内容发布和素材管理',
        icon: 'FileTextOutlined',
        category: 'content',
        author: '内容运营部',
        status: 'developing',
        createdAt: now,
        updatedAt: now,
        currentVersion: '0.5.0',
        versions: [
          {
            id: generateId(),
            version: '0.5.0',
            name: '功能开发',
            description: '核心功能开发中',
            entry: 'http://localhost:3004',
            status: 'draft',
            createdAt: now,
            updatedAt: now,
            isDefault: true,
            changelog: '1. 完成内容编辑功能\n2. 增加素材库\n3. 开发多渠道发布',
            dependencies: { 'react': '^18.2.0' },
          },
        ],
        routes: [
          {
            id: generateId(),
            path: '/content/articles',
            name: 'articles',
            title: '文章管理',
            icon: 'ReadOutlined',
            order: 1,
            visibleInMenu: true,
            meta: {},
          },
          {
            id: generateId(),
            path: '/content/materials',
            name: 'materials',
            title: '素材库',
            icon: 'FolderOutlined',
            order: 2,
            visibleInMenu: true,
            meta: {},
          },
          {
            id: generateId(),
            path: '/content/publish',
            name: 'publish',
            title: '发布中心',
            icon: 'SendOutlined',
            order: 3,
            visibleInMenu: true,
            meta: {},
          },
        ],
        sandboxConfig: DEFAULT_SANDBOX_CONFIG,
      },
    ];

    this._apps = sampleApps;
    this.saveToStorage();
  }
}

export const microAppRegistry = new MicroAppRegistry();
